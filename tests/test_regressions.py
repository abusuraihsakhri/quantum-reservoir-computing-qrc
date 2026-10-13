"""Regression tests for audit integrity, PHI handling, and API behavior."""
import copy

import pytest
from fastapi.testclient import TestClient

from agents.api import app
from agents.base import AuditTrail, PHIGuard, SecurityException
from agents.llm_factory import LLMFactory
from agents.models import SystemTaskPayload
from agents.supervisor import SystemSupervisor
from cli import main


def test_audit_trail_detects_modified_signed_fields():
    trail = AuditTrail(secret_key="non-production-test-key")
    trail.log("worker", "tier", "evaluation", {"task_id": "T-001"})
    assert trail.verify_integrity()

    original = copy.deepcopy(trail.logs[0])
    for field in ("actor", "event_type", "timestamp", "payload_hash", "current_hash", "prev_hash"):
        trail.logs[0][field] = "modified"
        assert not trail.verify_integrity(), field
        trail.logs[0] = copy.deepcopy(original)
        assert trail.verify_integrity()


def test_audit_trail_returns_detached_snapshots():
    trail = AuditTrail(secret_key="non-production-test-key")
    entry = trail.log("worker", "tier", "evaluation", {"task_id": "T-001"})
    entry["current_hash"] = "modified"
    exposed = trail.get_trail()
    exposed[0]["actor"] = "modified"
    assert trail.verify_integrity()
    assert trail.get_trail()[0]["actor"] == "worker"


def test_audit_rejects_identifiers_in_attributes():
    supervisor = SystemSupervisor()
    payload = SystemTaskPayload(
        task_id="T-001", target_identifier="TARGET-01",
        primary_metric=12, attributes={"nested": {"contact": "person@example.org"}},
    )
    with pytest.raises(SecurityException):
        supervisor.process_task(payload)


def test_mock_provider_does_not_claim_verification():
    assert "No analysis" in LLMFactory.create("mock").invoke("status")
    with pytest.raises(ValueError, match="not implemented"):
        LLMFactory.create("openai")


def test_api_mount_and_safe_errors():
    client = TestClient(app)
    assert client.get("/health").status_code == 200
    root = client.get("/")
    assert root.status_code == 200
    assert "Evaluation Console" in root.text
    assert client.get("/app.mjs").status_code == 200

    valid = client.post("/api/audit", json={
        "task_id": "T-001", "target_identifier": "TARGET-01",
        "primary_metric": 26, "secondary_metric": 1,
    })
    assert valid.status_code == 200
    assert valid.json()["overall_urgency"] == "ELEVATED_RISK"
    assert valid.json()["audit_hash"]

    sensitive = client.post("/api/audit", json={
        "task_id": "T-002", "target_identifier": "TARGET-01",
        "primary_metric": 26, "attributes": {"contact": "person@example.org"},
    })
    assert sensitive.status_code == 400
    assert "person@example.org" not in sensitive.text
    chat = client.post("/api/chat", json={"query": "contact me at person@example.org"})
    assert chat.status_code == 400
    assert "person@example.org" not in chat.text


def test_batch_skips_phi_rows(tmp_path, capsys):
    source = tmp_path / "data.csv"
    target = tmp_path / "results.csv"
    source.write_text(
        "task_id,target_identifier,primary_metric,secondary_metric,status_descriptor\n"
        "T-001,TARGET-01,11,1,NOMINAL\n"
        "T-002,person@example.org,11,1,NOMINAL\n", encoding="utf-8"
    )
    assert main(["batch", "-i", str(source), "-o", str(target)]) == 0
    lines = target.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    assert "Skipping row" in capsys.readouterr().err
