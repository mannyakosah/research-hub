from contract.types import BalanceCorrection, SensorFrame


def correction_error(output: BalanceCorrection, frame: SensorFrame) -> float:
    """Round abs(correction_angle - wheel_angle) to one decimal."""
    return round(abs(output.correction_angle - frame.wheel_angle), 1)
