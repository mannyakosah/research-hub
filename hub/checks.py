from algorithms.wheel_balance.score import correction_error
from algorithms.wheel_balance.test_algorithm import test_both_algorithms_stay_in_contract_and_are_pure
from contract.check import check_ranges
from contract.types import BalanceCorrection
from hub.models import CheckResult
from hub.store import Store
from registry.registry import Registry

CANDIDATE = "wheel-balance:a81f3e2"
V1 = "wheel-balance:1"


def _error(registry: Registry, artifact_id: str, frame) -> float:
    output = registry.get(artifact_id).run(frame)
    return correction_error(output, frame)


def check_contract(store: Store, registry: Registry) -> CheckResult:
    try:
        for run in store.runs():
            for frame in run.measurements:
                output = registry.get(CANDIDATE).run(frame)
                if not isinstance(output, BalanceCorrection):
                    raise TypeError("candidate did not return a BalanceCorrection")
                check_ranges(output)
    except Exception as exc:
        return CheckResult(name="contract", passed=False, detail=str(exc))
    return CheckResult(name="contract", passed=True, detail="candidate outputs match the contract")


def check_unit_tests() -> CheckResult:
    try:
        test_both_algorithms_stay_in_contract_and_are_pure()
    except AssertionError as exc:
        return CheckResult(name="unit_tests", passed=False, detail=str(exc) or "unit tests failed")
    return CheckResult(name="unit_tests", passed=True, detail="both algorithms are pure and in range")


def check_regression(store: Store, registry: Registry) -> CheckResult:
    v1_errors = []
    candidate_errors = []
    for number in (16, 17):
        frame = store.run(number).measurements[0]
        v1_errors.append(_error(registry, V1, frame))
        candidate_errors.append(_error(registry, CANDIDATE, frame))
    v1_mean = sum(v1_errors) / len(v1_errors)
    candidate_mean = sum(candidate_errors) / len(candidate_errors)
    detail = f"n=2, candidate mean {candidate_mean:.2f}, V1 mean {v1_mean:.2f}"
    return CheckResult(
        name="regression",
        passed=candidate_mean <= v1_mean,
        detail=detail,
    )


def check_reproducibility(store: Store, registry: Registry) -> CheckResult:
    frame = store.run(18).measurements[0]
    candidate = registry.get(CANDIDATE)
    first = candidate.run(frame)
    second = candidate.run(frame)
    return CheckResult(
        name="reproducibility",
        passed=first == second,
        detail="same row, same output" if first == second else "outputs differed",
    )


def check_shop_evidence(store: Store) -> CheckResult:
    found = any(
        run.status == "Complete"
        and run.tested.kind == "candidate"
        and run.tested.commit == "a81f3e2"
        for run in store.runs()
    )
    return CheckResult(
        name="shop_evidence",
        passed=found,
        detail="run 18 tested the candidate" if found else "no complete candidate run",
    )


def run_checks(store: Store, registry: Registry) -> list[CheckResult]:
    return [
        check_contract(store, registry),
        check_unit_tests(),
        check_regression(store, registry),
        check_reproducibility(store, registry),
        check_shop_evidence(store),
    ]
