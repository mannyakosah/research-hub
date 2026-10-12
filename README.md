# Research Hub

Researchers turn sensor readings into a small set of numbers that move a tire-shop rig. The work sits in separate repositories, MATLAB notebooks, and loose files. A result that looks good is packaged by hand into a Python wheel the production app imports. Shop tests are recorded by technicians who did not write the algorithm, and those notes are easy to lose.

Research Hub is a lifecycle for that path.

An algorithm is one part of the rig, with one repository and released versions. An investigation is the question a researcher is working on. Shop runs are structured records a technician can fill in. The bytes tested in the shop are the bytes production runs.

## Worked example

Wheel balance, a fictional algorithm with seeded shop runs. The sensor math is a stand-in. The lifecycle is the point.

1. **Wheel Balance.** Current release V1. One repository. The contract is four inputs and four outputs.
2. Its investigation, **Reduce correction error**. Candidate commit `a81f3e2`, built as `wheel-balance:a81f3e2`, pinned in dev.
3. **Run #18.** A technician filled the form at Woburn: setup, measurement rows, CSV, photos, video, note. Result 1.8°, against 3.1° for V1 on run #17.
4. Release. Checks pass. The candidate artifact becomes **V2**. Production is pinned to it. The bytes do not change between the shop and production.
5. `POST /algorithms/wheel-balance/v2/predict` returns the four outputs.

## Docs

| Doc | What it covers |
| --- | --- |
| [Problem](docs/00-problem.md) | The gap between research and the rig |
| [Domain model](docs/01-domain-model.md) | Algorithm, version, investigation, procedure, run |
| [Models](docs/models.md) | The five records as classes |
| [Lifecycle](docs/03-lifecycle.md) | Investigation statuses, release, dev and prod |
| [Architecture](docs/02-architecture.md) | Components, contract, where code lives |
| [Run protocol](docs/04-run-protocol.md) | The shop form and file tracking |
| [Further design](docs/06-beyond-the-demo.md) | Safety, reproducibility, fleet, MATLAB, adoption |
| [Implementation plan](plan/README.md) | Build order, files, and functions |

Diagrams: [Research Hub board](https://www.figma.com/board/X5sMGPvWUpY001vv4XIV5k).

## Status

Design and implementation plan. The build is one process: `contract/`, `algorithms/wheel_balance/`, `registry/`, `hub/`, `api/`, and `frontend/`.
