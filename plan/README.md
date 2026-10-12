# Implementation plan

One process. The contract is Python, so the algorithm, the checks, and the API live together. Dev and prod are two pins in that process. CI is a function call. The registry is a map from artifact id to the wheel's hash.

The production artifact is a Python wheel the app imports. A predict call is a way to show consumption. With a wheel and no service, the app calls `Algorithm.run` in-process.

## Phase 1 — Algorithm and seed

Make `algorithms/wheel_balance/` callable.

- `Algorithm.run(SensorFrame) -> BalanceCorrection` for `wheel-balance:1` and the candidate `a81f3e2`.
- The contract carries output ranges and `confidence`. The contract check uses them.
- Seed the five records and runs #16, #17, and #18, including the run folder for #18.
- One test: replay the stored rows. The candidate's error on #18 is 1.8°, against 3.1° and 3.4° for V1.

Done when a test, not a screen, produces those numbers.

## Phase 2 — Lifecycle API

Add `api/` over that seed.

- Read the algorithm, the investigation, the three runs, and V1.
- `POST /release` runs the five checks in [the lifecycle](../docs/03-lifecycle.md). On pass it publishes `wheel-balance:2` as the same object, sets the current release to V2, marks the investigation Released, and moves the prod pin from V1 to V2.
- Prod predict rejects the candidate. Dev predict accepts it.
- Rollback moves the prod pin back to V1 and leaves V2 in the registry.

Done when those calls work from a terminal.

## Phase 3 — Click path

Add `frontend/` with three pages.

1. Wheel Balance: repository, current release, the contract, and a predict panel.
2. Reduce correction error: candidate, status, the run list, and release.
3. Run #18, with setup, measurements, files, and the result.

Skip accounts, a second algorithm, creating investigations, and live capture. The run is seeded. The release button is the only write that has to work live.

## Stretch

After the click path works once, in this order: lineage, shadow mode, a real wheel file, a rig manifest, a library call, and a regression summary with n and spread. Details are in [07-stretch.md](07-stretch.md).

## Specification

| File | Covers |
| --- | --- |
| [01-repository.md](01-repository.md) | Tree, stack, how to run |
| [02-contract-algorithm-registry.md](02-contract-algorithm-registry.md) | Types, the two `run` functions, the registry, same bytes |
| [03-hub-and-api.md](03-hub-and-api.md) | Records, checks, release, rollback, predict, routes |
| [04-seed.md](04-seed.md) | Records, rows, run folders, the numbers 3.4 / 3.1 / 1.8 |
| [05-frontend.md](05-frontend.md) | Routes, components, hooks |
| [06-tests.md](06-tests.md) | Tests that prove the story before any screen |
| [07-stretch.md](07-stretch.md) | Lineage, shadow, a real wheel, manifest, library, variance |
