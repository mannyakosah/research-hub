from pydantic import BaseModel, Field


class SensorFrame(BaseModel):
    radial_force: float
    lateral_force: float
    wheel_angle: float
    wheel_speed: float


class BalanceCorrection(BaseModel):
    correction_angle: float = Field(ge=0, le=360)
    correction_weight: float = Field(ge=0, le=10)
    lateral_adjustment: float = Field(ge=-5, le=5)
    confidence: float = Field(ge=0, le=1)


RANGES: dict[str, tuple[float, float]] = {
    "correction_angle": (0, 360),
    "correction_weight": (0, 10),
    "lateral_adjustment": (-5, 5),
    "confidence": (0, 1),
}
