"""Validate the checked-in golden cases against the actual rule engine."""
import json
from pathlib import Path

import pytest

from agents.base import PHIGuard, SecurityException
from agents.models import SystemTaskPayload
from agents.supervisor import SystemSupervisor


BENCHMARK = json.loads(
    (Path(__file__).parents[1] / "benchmark_dataset.json").read_text(encoding="utf-8")
)


@pytest.mark.parametrize("case", [case for case in BENCHMARK["test_cases"] if "payload" in case],
                         ids=lambda case: case["case_id"])
def test_rule_engine_matches_golden_cases(case):
    payload = SystemTaskPayload(**case["payload"])
    dossier = SystemSupervisor().process_task(payload)
    assert dossier.overall_urgency.value == case["expected_urgency"]
    assert dossier.integrity_status.value == case["expected_integrity"]


def test_benchmark_identifier_pattern_is_blocked():
    case = next(c for c in BENCHMARK["test_cases"] if "adversarial_prompt" in c)
    with pytest.raises(SecurityException):
        PHIGuard.assert_no_phi(case["adversarial_prompt"])
