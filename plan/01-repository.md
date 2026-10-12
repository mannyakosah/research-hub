# Repository

One folder, one process. The separate repos in the architecture doc (`research-hub`, `wheel-balance`, `algorithm-contract`) are the real layout. The demo colocates them and says so.

## Stack

- Python 3.12, FastAPI, Pydantic v2, pytest, uvicorn
- Vite, React, TypeScript
- No database. The store loads `data/seed.json` into memory at startup. Release and rollback mutate that memory.
- Run files live on disk under `data/files/`.
- No auth, no second algorithm, no live form entry.

## Tree

```text
ATI/
  README.md                      how to run, the five-step story, link to the board
  pyproject.toml                 package research-hub, deps, pytest
  contract/
    __init__.py
    types.py                     SensorFrame, BalanceCorrection, ranges
    check.py                     check_ranges
  algorithms/
    wheel_balance/
      __init__.py
      algorithm.py               WheelBalanceV1, WheelBalanceCandidate
      score.py                   correction_error
      test_algorithm.py          unit test the release check calls
  registry/
    __init__.py
    registry.py                  artifact id -> the same function object
  hub/
    __init__.py
    models.py                    Algorithm, Version, Investigation, Procedure, Run
    store.py                     load seed, read, release, rollback
    checks.py                    the five checks
    release.py                   release(), rollback()
    predict.py                   predict(), pin rules
    files.py                     list a run folder
  api/
    __init__.py
    main.py                      FastAPI app, routes
    schemas.py                   response models, same shapes the UI uses
  data/
    seed.json
    files/investigations/reduce-correction-error/...
  tests/
    test_story.py                3.4, 3.1, 1.8 from replay
    test_release.py              same object, pins, prod rejects candidate, rollback
  frontend/
    index.html
    package.json
    vite.config.ts               proxy /api -> localhost:8000
    src/
      main.tsx
      App.tsx
      api/client.ts
      api/types.ts
      hooks/...
      pages/...
      components/...
      styles.css
```

`internal/` stays gitignored. `docs/` ships.

## Run

```text
uvicorn api.main:app --reload --port 8000
cd frontend && npm run dev
```

Vite on port 5173. The browser talks only to `/api/...`. `client.ts` prefixes that.

## One folder, three packages

`contract/`, `algorithms/wheel_balance/`, and `hub/` sit in one folder here. In the real layout they are three repositories. They release on different clocks.
