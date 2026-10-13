// Pure rule evaluator used only for explicitly unsigned, local previews.
// The hosted Python API remains the authority for signed, server-side dossiers.
export function evaluateLocally(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid input payload.");
  for (const key of ["task_id", "target_identifier"]) {
    if (typeof payload[key] !== "string" || !payload[key].trim()) {
      throw new Error(key + " must be a non-empty string.");
    }
  }
  for (const key of ["primary_metric", "secondary_metric"]) {
    if (typeof payload[key] !== "number" || !Number.isFinite(payload[key])) {
      throw new Error(key + " must be a finite number.");
    }
  }
  if (typeof payload.is_critical_flag !== "boolean") {
    throw new Error("is_critical_flag must be a boolean.");
  }
  if (typeof payload.status_descriptor !== "string") {
    throw new Error("status_descriptor must be a string.");
  }

  const alerts = [];
  const add = (worker, urgency, summary) => alerts.push({
    origin_worker: worker, urgency, summary
  });
  if (payload.primary_metric > 25) {
    add("InvariantQCWorker", "ELEVATED_RISK", "Primary metric exceeds 25.");
  }
  if (payload.is_critical_flag || payload.secondary_metric > 12) {
    add("SafetyEscalationWorker",
      payload.is_critical_flag ? "CRITICAL_STAT_PANIC" : "ELEVATED_RISK",
      "Critical flag or secondary metric exceeds 12.");
  }
  const descriptor = payload.status_descriptor.toUpperCase();
  if (["DISCORDANT", "ANOMALY", "MUTANT", "VIOLATION", "FAIL", "REJECT"]
      .some(flag => descriptor.includes(flag))) {
    add("ProtocolConformanceWorker", "ELEVATED_RISK", "Status descriptor triggers conformance review.");
  }
  const critical = alerts.filter(a => a.urgency === "CRITICAL_STAT_PANIC").length;
  const urgency = critical ? "CRITICAL_STAT_PANIC" : alerts.length ? "ELEVATED_RISK" : "ROUTINE";
  const integrity = critical ? "RECALIBRATION_REQUIRED" :
    alerts.length ? "DISCORDANT_ANOMALY" : "VALIDATED_OPTIMAL";
  return {
    mode: "LOCAL_PREVIEW",
    signed: false,
    note: "Illustrative threshold output only. No quantum simulation, consensus protocol or HMAC signing performed.",
    task_id: payload.task_id,
    target_identifier: payload.target_identifier,
    overall_urgency: urgency,
    integrity_status: integrity,
    total_alerts: alerts.length,
    critical_alerts_count: critical,
    alerts
  };
}

async function evaluateApi(payload) {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let message = "Connected API request failed (HTTP " + response.status + ").";
    try {
      const details = await response.json();
      if (typeof details.detail === "string") message += " " + details.detail;
    } catch (_) { /* A missing backend may return HTML rather than JSON. */ }
    throw new Error(message);
  }
  return await response.json();
}

if (typeof document !== "undefined") {
  const form = document.getElementById("audit-form");
  const result = document.getElementById("result");
  const message = document.getElementById("message");
  const runButton = document.getElementById("run");
  const exportButton = document.getElementById("export");
  let lastResult = null;
  let count = 0;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const get = id => document.getElementById(id).value;
    const payload = {
      task_id: get("task_id").trim(),
      target_identifier: get("target_identifier").trim(),
      primary_metric: Number(get("primary_metric")),
      secondary_metric: Number(get("secondary_metric")),
      status_descriptor: get("status_descriptor"),
      is_critical_flag: document.getElementById("is_critical_flag").checked
    };
    runButton.disabled = true;
    message.classList.remove("error");
    message.textContent = "Evaluating…";
    try {
      const mode = get("mode");
      const output = mode === "api" ? await evaluateApi(payload) : evaluateLocally(payload);
      lastResult = output;
      result.textContent = JSON.stringify(output, null, 2);
      count += 1;
      document.getElementById("count").textContent = String(count);
      document.getElementById("urgency").textContent = output.overall_urgency || "—";
      document.getElementById("alerts").textContent = String(output.total_alerts ?? "—");
      message.textContent = mode === "local" ?
        "Local preview complete — unsigned; inputs remained in this browser." :
        "Backend evaluation completed; inspect dossier and audit fields.";
      exportButton.disabled = false;
    } catch (error) {
      lastResult = null;
      exportButton.disabled = true;
      message.classList.add("error");
      message.textContent = error instanceof Error ? error.message : "Evaluation failed.";
      result.textContent = "No result produced.";
    } finally {
      runButton.disabled = false;
    }
  });

  exportButton.addEventListener("click", () => {
    if (lastResult === null) return;
    const blob = new Blob([JSON.stringify(lastResult, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrc-evaluation.json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  form.addEventListener("reset", () => {
    lastResult = null;
    exportButton.disabled = true;
    result.textContent = "No evaluation performed.";
    message.textContent = "Ready for local evaluation.";
    message.classList.remove("error");
    document.getElementById("urgency").textContent = "—";
    document.getElementById("alerts").textContent = "—";
  });
}
