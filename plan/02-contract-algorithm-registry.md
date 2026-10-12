# Contract, algorithm, registry

## `contract/types.py`

```python
class SensorFrame(BaseModel):
    radial_force: float
    lateral_force: float
    wheel_angle: float
    wheel_speed: float

class BalanceCorrection(BaseModel):
    correction_angle: float
    correction_weight: float
    lateral_adjustment: float
    confidence: float
```

Ranges the contract check enforces:

| Field | Min | Max |
| --- | --- | --- |
| `correction_angle` | 0 | 360 |
| `correction_weight` | 0 | 10 |
| `lateral_adjustment` | -5 | 5 |
| `confidence` | 0 | 1 |

```python
def check_ranges(output: BalanceCorrection) -> None:
    """Raise ContractError naming the field when a value is outside its range."""
```

This package is the stand-in for `algorithm-contract`. Both the algorithm and the checks import it. Neither side defines the types for itself.

## `algorithms/wheel_balance/score.py`

Ground truth for the demo is the measured wheel angle. The error is how far the commanded angle lands from it. That stands in for a second reading on a reference balancer.

```python
def correction_error(output: BalanceCorrection, frame: SensorFrame) -> float:
    """Round abs(correction_angle - wheel_angle) to one decimal."""
```

## `algorithms/wheel_balance/algorithm.py`

```python
class Algorithm(Protocol):
    def run(self, inputs: SensorFrame) -> BalanceCorrection: ...
```

Both classes are pure. Same frame, same output, every time. That is the reproducibility check.

`WheelBalanceV1.run`

- `correction_angle` = `wheel_angle` + `lateral_force`
- `correction_weight` = `radial_force / 10`, one decimal
- `lateral_adjustment` = `-lateral_force / 10`, two decimals
- `confidence` = `0.86`

`WheelBalanceCandidate.run`

- `correction_angle` = `wheel_angle` + `lateral_force * 0.5`
- `correction_weight` and `lateral_adjustment` same formulas as V1
- `confidence` = `0.94`

With the seeded `lateral_force` values, the errors fall out as 3.4, 3.1, and 1.8. See [04-seed.md](04-seed.md). The candidate's residual is half of V1's on every row, so replaying it on runs 16 and 17 is better than V1 on those same rows. That is the regression check.

Clamp `correction_angle` into 0..360 so the contract ranges hold for the seeded rows. The seed angles are near 20–30 degrees, so the add never wraps.

## `registry/registry.py`

The registry is a dict from artifact id to one function object. Building an artifact means registering that object. Publishing a version means adding a second id for the same object. Nothing calls the function through a new build at release time.

| Artifact id | Object | When it exists |
| --- | --- | --- |
| `wheel-balance:1` | `WheelBalanceV1` | at startup |
| `wheel-balance:a81f3e2` | `WheelBalanceCandidate` | at startup |
| `wheel-balance:2` | the same `WheelBalanceCandidate` object | after release |

```python
class Registry:
    def register(self, artifact_id: str, algorithm: Algorithm) -> None: ...
    def get(self, artifact_id: str) -> Algorithm: ...
    def publish_same_bytes(self, source_id: str, release_id: str) -> None:
        """Point release_id at the object already stored under source_id."""
    def same_object(self, a: str, b: str) -> bool:
        """True when both ids are the identical Python object. The test asserts this."""
```

`hash_of(artifact_id) -> str` returns a short stable hash of the class name plus source. V2's hash equals the candidate's hash. The UI can show both ids and one hash.

A real wheel file is a stretch. See [07-stretch.md](07-stretch.md). Until then, "bytes" means this object identity. Production would install one `.whl`.
