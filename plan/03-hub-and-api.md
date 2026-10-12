# Hub and API

The hub holds records and enforces the lifecycle. It calls into `contract`, `registry`, and `algorithms.wheel_balance.score`. It does not reimplement `run`.

## `hub/models.py`

Pydantic models, seeded then mutated.

`AlgorithmRecord`

| Field | At startup |
| --- | --- |
| `id` | `wheel-balance` |
| `name` | Wheel Balance |
| `repository` | `wheel-balance` |
| `contract` | `SensorFrame` in, `BalanceCorrection` out, plus the ranges |
| `current_release` | `V1` |
| `procedure_revision` | `3` |

`VersionRecord`: `number`, `algorithm_id`, `commit`, `artifact_id`, `from_investigation`, `evidence_run`, `released_by`, `released_at`. Only V1 exists at startup. V2 is appended by `release`.

`InvestigationRecord`: `id` `reduce-correction-error`, `name`, `algorithm_id`, `owner` Researcher A, `candidate_commit` `a81f3e2`, `candidate_artifact` `wheel-balance:a81f3e2`, `status` `Testing`, `outcome` empty, `folder`.

`ProcedureRecord`: `algorithm_id`, `revision` 3, and the four blocks (setup, measurements, files, result) as field lists for the form UI.

`RunRecord`: the fields in the domain model. `tested` is `{ "kind": "version", "number": "V1" }` or `{ "kind": "candidate", "commit": "a81f3e2" }`. `correction_error` is stored as the result the hub wrote when the run completed. Replay recomputes it and the test checks they match.

`Pins`: `dev` = `wheel-balance:a81f3e2`, `prod` = `wheel-balance:1`.

`CheckResult`: `name`, `passed`, `detail`.

## `hub/store.py`

```python
class Store:
    def load(path: Path) -> Store: ...
    def algorithm(self) -> AlgorithmRecord: ...
    def versions(self) -> list[VersionRecord]: ...
    def investigation(self) -> InvestigationRecord: ...
    def procedure(self) -> ProcedureRecord: ...
    def runs(self) -> list[RunRecord]: ...          # 18, 17, 16
    def run(self, number: int) -> RunRecord: ...
    def pins(self) -> Pins: ...
```

Reads return copies. Writes happen only through `release` and `rollback`.

## `hub/files.py`

```python
def list_run_files(folder: Path) -> list[RunFile]:
    """Name, kind (csv, photo, video, note), relative path, byte size."""
```

The UI links to `GET .../runs/{n}/files/{path}`. FastAPI `FileResponse`. Seeded files only. No upload route.

## `hub/checks.py`

```python
def run_checks(store: Store, registry: Registry) -> list[CheckResult]:
```

Each check returns one `CheckResult`. `run_checks` runs all five even after a failure, so the panel can show each line.

| Function | Passes when |
| --- | --- |
| `check_contract` | For every measurement row on runs 16–18, the candidate's output is a `BalanceCorrection` inside the ranges |
| `check_unit_tests` | `algorithms/wheel_balance/test_algorithm.py` passes. Call pytest in-process, or import the assertions directly if pytest-in-request is awkward. The assertions: both classes return four fields, in range, and are pure |
| `check_regression` | On the rows of runs 16 and 17, the candidate's mean `correction_error` is less than or equal to V1's mean on those same rows |
| `check_reproducibility` | `candidate.run(row)` twice on run 18's first row returns equal outputs |
| `check_shop_evidence` | At least one run has status Complete and `tested.kind == candidate` with commit `a81f3e2` |

## `hub/release.py`

```python
def release(store: Store, registry: Registry) -> ReleaseOutcome:
    """Run the checks. When all pass, publish V2 from the candidate object,
    move the prod pin, mark the investigation Released. Return the checks either way."""

def rollback(store: Store, registry: Registry) -> Pins:
    """Point current_release and the prod pin back at V1. Leave V2 in the registry
    and on the version list. Leave the investigation Released."""
```

`release` does these writes, in order, and only when every check passed:

1. `registry.publish_same_bytes("wheel-balance:a81f3e2", "wheel-balance:2")`
2. Append `VersionRecord` number `V2`, commit `a81f3e2`, artifact `wheel-balance:2`, from the investigation, evidence run 18, released_by Researcher A, released_at now.
3. `algorithm.current_release = "V2"`
4. `investigation.status = "Released"`, `outcome = "Released as V2"`
5. `pins.prod = "wheel-balance:2"`
6. Dev pin stays on the candidate id. Both ids are the same object, so dev and prod are running one build.

A second call to `release` after success returns the existing V2 and does not create V3. One investigation, one release.

The git tag and the default-branch move are records on the version (`commit`, `number`), not a real git command. Say that if asked. The stretch wheel file is the optional real byte.

## `hub/predict.py`

```python
def predict(store, registry, environment: Literal["dev", "prod"], frame: SensorFrame) -> PredictResult:
    """Resolve the pin for that environment, call registry.get(pin).run(frame)."""
```

`PredictResult`: `environment`, `artifact_id`, `version` (number or null when the pin is the candidate), `output`.

Pin rules, checked inside `predict` if a caller passes an artifact id, and by default using the environment's pin:

| Environment | May call |
| --- | --- |
| dev | `pins.dev`, which is the current release's artifact or the one candidate |
| prod | a numbered version only. The demo button calls `pins.prod` |

```python
def assert_allowed(environment: str, artifact_id: str, store: Store) -> None:
    """Prod + an id with no version number raises NotReleased."""
```

The candidate id has no version number before release. After release, `wheel-balance:2` has a number and `wheel-balance:a81f3e2` still does not. Prod calls `:2`. Dev may still call `:a81f3e2`. Same object.

## `api/main.py`

Prefix `/api`.

| Method | Path | Calls | Returns |
| --- | --- | --- | --- |
| GET | `/algorithms/wheel-balance` | `algorithm`, `versions`, `procedure`, `pins` | one payload for the algorithm page |
| GET | `/algorithms/wheel-balance/investigations/reduce-correction-error` | `investigation`, `runs` | investigation page |
| GET | `/algorithms/wheel-balance/investigations/reduce-correction-error/runs/{number}` | `run` | one run |
| GET | `/algorithms/wheel-balance/investigations/reduce-correction-error/runs/{number}/files` | `list_run_files` | file list |
| GET | `/algorithms/wheel-balance/investigations/reduce-correction-error/runs/{number}/files/{path}` | `FileResponse` | the byte |
| POST | `/algorithms/wheel-balance/release` | `release` | `{ checks, released, version, pins }` |
| POST | `/algorithms/wheel-balance/rollback` | `rollback` | `{ pins, current_release }` |
| POST | `/algorithms/wheel-balance/predict` | `predict` | `PredictResult` |
| GET | `/environments` | `pins` | `{ dev, prod }` |

Predict body:

```json
{ "environment": "prod", "inputs": { "radial_force": 12.4, "lateral_force": 3.1, "wheel_angle": 27.2, "wheel_speed": 8.3 } }
```

The server chooses the artifact from the pin. The client does not send an artifact id on the happy path. A query `?artifact=` exists for the test that prod rejects `wheel-balance:a81f3e2`, and returns 409 with `{ "error": "not_released" }`.

CORS open to `localhost:5173`.

Startup: `Store.load`, `Registry()` with V1 and the candidate registered. Held on `app.state`.
