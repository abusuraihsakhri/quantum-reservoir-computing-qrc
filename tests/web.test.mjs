import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLocally } from "../web/app.mjs";

const nominal = {
  task_id: "T-001",
  target_identifier: "TARGET-01",
  primary_metric: 12,
  secondary_metric: 4,
  status_descriptor: "NOMINAL",
  is_critical_flag: false
};

test("local preview is unsigned and correctly nominal", () => {
  const result = evaluateLocally(nominal);
  assert.equal(result.mode, "LOCAL_PREVIEW");
  assert.equal(result.signed, false);
  assert.equal(result.overall_urgency, "ROUTINE");
  assert.equal(result.total_alerts, 0);
  assert.equal("audit_hash" in result, false);
});

test("boundary behavior matches three Python workers", () => {
  const boundary = evaluateLocally({ ...nominal, primary_metric: 25, secondary_metric: 12 });
  assert.equal(boundary.total_alerts, 0);
  const elevated = evaluateLocally({
    ...nominal, primary_metric: 25.01, secondary_metric: 12.01, status_descriptor: "FAIL"
  });
  assert.equal(elevated.total_alerts, 3);
  assert.equal(elevated.overall_urgency, "ELEVATED_RISK");
});

test("critical flag overrides other urgency", () => {
  const result = evaluateLocally({ ...nominal, is_critical_flag: true });
  assert.equal(result.overall_urgency, "CRITICAL_STAT_PANIC");
  assert.equal(result.integrity_status, "RECALIBRATION_REQUIRED");
  assert.equal(result.critical_alerts_count, 1);
});

test("rejects invalid inputs rather than fabricating results", () => {
  assert.throws(() => evaluateLocally({ ...nominal, primary_metric: Number.NaN }), /finite/);
  assert.throws(() => evaluateLocally({ ...nominal, task_id: " " }), /non-empty/);
  assert.throws(() => evaluateLocally({ ...nominal, is_critical_flag: "false" }), /boolean/);
});
