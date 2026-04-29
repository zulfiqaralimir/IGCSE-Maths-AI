"""Post-validation layer — never trust raw AI output."""

from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    passed: bool
    failures: list[str] = field(default_factory=list)


def validate_structure(text: str) -> ValidationResult:
    """Response must contain at least one Step and a Final Answer."""
    failures = []
    if not re.search(r"Step\s+\d+\s*:", text, re.IGNORECASE):
        failures.append("Missing 'Step N:' structure")
    if not re.search(r"Final\s+Answer\s*:", text, re.IGNORECASE):
        failures.append("Missing 'Final Answer:' line")
    return ValidationResult(passed=not failures, failures=failures)


def validate_correctness(ai_text: str, correct_answer: str) -> ValidationResult:
    """
    Lightweight check: extract the Final Answer line from the AI response
    and compare key numeric/set tokens against the correct answer.
    Falls through (passes) if we cannot extract a clear answer — the
    structure validator already caught malformed responses.
    """
    match = re.search(
        r"Final\s+Answer\s*:\s*(.+)", ai_text, re.IGNORECASE | re.DOTALL
    )
    if not match:
        return ValidationResult(passed=False, failures=["Cannot extract Final Answer"])

    ai_answer = match.group(1).strip().lower()
    expected = correct_answer.strip().lower()

    # Extract numeric tokens and compare
    ai_nums = set(re.findall(r"\d+", ai_answer))
    exp_nums = set(re.findall(r"\d+", expected))

    if exp_nums and not ai_nums.intersection(exp_nums):
        return ValidationResult(
            passed=False,
            failures=[f"Answer numbers {ai_nums} do not match expected {exp_nums}"],
        )

    return ValidationResult(passed=True)


def validate_diagram(diagram_required: bool, diagram_url: str | None) -> ValidationResult:
    if diagram_required and not diagram_url:
        return ValidationResult(
            passed=False, failures=["Diagram required but not generated"]
        )
    return ValidationResult(passed=True)


def validate(
    ai_text: str,
    correct_answer: str,
    diagram_required: bool = False,
    diagram_url: str | None = None,
) -> ValidationResult:
    checks = [
        validate_structure(ai_text),
        validate_correctness(ai_text, correct_answer),
        validate_diagram(diagram_required, diagram_url),
    ]
    all_failures = [f for c in checks for f in c.failures]
    return ValidationResult(passed=not all_failures, failures=all_failures)
