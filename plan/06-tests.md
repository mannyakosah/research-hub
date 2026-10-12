# Tests

Phase 1 is done when `pytest` passes and no screen exists yet. The API tests in the same file are Phase 2. Run them with `pytest` from the repo root.

## `algorithms/wheel_balance/test_algorithm.py`

Called by `check_unit_tests` as well as by pytest.

- `WheelBalanceV1.run` and `WheelBalanceCandidate.run` each return a `BalanceCorrection`.
- Every field is inside `contract.check` ranges for the sample frame.
- Calling `run` twice on that frame returns equal outputs.

## `tests/test_story.py`

Uses the seed and the registry. No HTTP.

- Replay V1 on run 16's row. `correction_error` is 3.4.
- Replay V1 on run 17's row. `correction_error` is 3.1.
- Replay the candidate on run 18's row. `correction_error` is 1.8.
- Those three numbers equal the `correction_error` stored on the run records.
- Replay the candidate on run 16 and run 17. Each error is lower than V1 on that same row.

## `tests/test_release.py`

- Before release, prod pin is `wheel-balance:1`, dev pin is `wheel-balance:a81f3e2`, versions are `[V1]`, investigation status is Testing.
- `predict("prod", sample)` uses `wheel-balance:1`.
- `predict("dev", sample)` uses `wheel-balance:a81f3e2`.
- `assert_allowed("prod", "wheel-balance:a81f3e2")` raises `NotReleased`.
- `release` returns five passed checks.
- `registry.same_object("wheel-balance:a81f3e2", "wheel-balance:2")` is true.
- Current release is V2. Prod pin is `wheel-balance:2`. Dev pin is still the candidate id. Investigation status is Released. V1 is still in `versions`.
- `predict("prod", sample)` now uses `wheel-balance:2` and returns confidence 0.94.
- `rollback` sets the prod pin and current release to V1. `same_object` is still true. V2 is still in `versions`.
- A second `release` does not append V3.

## `tests/test_api.py`

Phase 2. `TestClient` against `api.main:app`.

- GET the algorithm. Name Wheel Balance, current release V1.
- GET the investigation. Status Testing. Three runs, errors 1.8, 3.1, 3.4 in the list order 18, 17, 16.
- GET run 18. Shop Woburn. Files include `sensor-data.csv`, two photos, the video placeholder, the note.
- POST release. 200. Body checks all passed. GET the algorithm again. Current release V2.
- POST predict `{ "environment": "prod", ...sample }` returns artifact `wheel-balance:2`.
- POST predict with `?artifact=wheel-balance:a81f3e2` and environment prod returns 409.
- POST rollback. GET environments. Prod is `wheel-balance:1`.

## What a failure means

If `test_story` fails, the formulas or the seed drifted. Fix those before writing a route. If `test_release` fails on `same_object`, release built a second function. That is the bug the demo exists to make impossible.
