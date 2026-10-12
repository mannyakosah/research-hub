from contract.check import check_ranges
from contract.types import SensorFrame
from algorithms.wheel_balance.algorithm import WheelBalanceCandidate, WheelBalanceV1

SAMPLE = SensorFrame(
    radial_force=12.4,
    lateral_force=3.1,
    wheel_angle=27.2,
    wheel_speed=8.3,
)


def test_both_algorithms_stay_in_contract_and_are_pure() -> None:
    for algorithm in (WheelBalanceV1(), WheelBalanceCandidate()):
        first = algorithm.run(SAMPLE)
        second = algorithm.run(SAMPLE)
        check_ranges(first)
        assert first == second
