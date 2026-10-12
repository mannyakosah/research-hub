from typing import Protocol

from contract.types import BalanceCorrection, SensorFrame


class Algorithm(Protocol):
    def run(self, inputs: SensorFrame) -> BalanceCorrection: ...


def _angle(wheel_angle: float, delta: float) -> float:
    angle = wheel_angle + delta
    while angle < 0:
        angle += 360
    while angle > 360:
        angle -= 360
    return round(angle, 1)


def _shared(frame: SensorFrame, delta: float, confidence: float) -> BalanceCorrection:
    return BalanceCorrection(
        correction_angle=_angle(frame.wheel_angle, delta),
        correction_weight=round(frame.radial_force / 10, 1),
        lateral_adjustment=round(-frame.lateral_force / 10, 2),
        confidence=confidence,
    )


class WheelBalanceV1:
    def run(self, inputs: SensorFrame) -> BalanceCorrection:
        return _shared(inputs, inputs.lateral_force, 0.86)


class WheelBalanceCandidate:
    def run(self, inputs: SensorFrame) -> BalanceCorrection:
        return _shared(inputs, inputs.lateral_force * 0.5, 0.94)
