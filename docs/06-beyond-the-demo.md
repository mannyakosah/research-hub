# Beyond the demo

The prototype shows one algorithm, one investigation, one release. A real bridge between research and the rig has to hold up under more than that. These are the questions I would expect to meet in the first year, what the design already does about each, and where I would start.

The demo implements the first row of each table. Everything else is a position, open to correction.

## Safety on the rig

The output of every algorithm moves hardware in a shop with a person standing next to it. That shapes the release process more than any software concern.

| Concern | Position |
| --- | --- |
| Output bounds | The contract carries a range for every output. `correction_weight` has a maximum. A value outside the range is a contract failure, in CI and at runtime. |
| Confidence | Every output includes `confidence`. The app has one safe default per algorithm when confidence is low: hold, repeat the measurement, or fall back to the current release. The default is part of the algorithm record. |
| Shadow mode | Dev can run a candidate beside the current release on the same measurement rows, log both, and actuate only the release. The first shop visits for a candidate produce evidence with no new risk to the rig. |
| Latency budget | Each algorithm declares a runtime budget. CI measures the candidate on the regression set against that budget on hardware matching the rig. |
| Kill switch | Rollback is a pin change. Any shop can be moved back to the previous version without a new build. |

Shadow mode is the item I would add to the prototype first. It turns the first shop runs of a candidate from a risk into a free comparison.

## What a version must reproduce

A version number is a promise that the result can be produced again. The record behind it has to be complete.

| Captured | Where | Why |
| --- | --- | --- |
| Source | The git commit and tag | Which code |
| Dependencies | A lock file hash, stored with the version | Which libraries, exactly |
| Environment | Python version, platform tag, runtime image if any | Where it ran |
| Parameters | A parameters file, versioned separately from code | Calibration constants change without code changes |
| Regression set | A named list of run ids, e.g. `wheel-balance-regression-3` | Which evidence judged it |
| Build | CI job id and artifact hash | Which bytes |

Parameters deserve their own line because they are the common leak. A tuned constant in a notebook that never reaches the repository is a release nobody can reproduce. The hub treats a parameters change as a candidate like any other, with its own replay.

## The contract over time

Sensors get added. Field names change. The contract is itself versioned, and compatibility is recorded.

- Every algorithm version states which contract version it accepts.
- A contract change ships through `algorithm-contract` with a CI check on both sides: the app still produces it, the algorithm still accepts it.
- Old runs keep their contract version. Replay maps older rows forward when a field has a default, and skips them when it does not. The regression report says how many rows each candidate was judged on.

## One rig, several algorithms

A rig runs more than one algorithm. Wheel balance is one. Bead seating and runout measurement are others. Each has its own repository, its own versions, and its own shop runs.

The shop app has to know which version of each algorithm to load. That list is a manifest. This one says: on a SmartBay 2, load wheel-balance 2, bead-seat 5, and runout 1.

```json
{ "rig": "smartbay-2", "algorithms": { "wheel-balance": "2", "bead-seat": "5", "runout": "1" } }
```

`rig` names the machine the list is for. Each entry under `algorithms` is an algorithm name and a version number. Those numbers are versions that have already been released. The app installs those wheels and no others.

A manifest is its own record. Once written, it does not change. Changing one version means writing a new manifest. The hub keeps the old one, the same way it keeps V1 after V2 exists.

A run still tests one algorithm. Run #18 tested wheel-balance. The other algorithms were also loaded, at whatever versions the manifest named. The run records that whole list, so a later replay knows the result was measured with bead-seat 5 and runout 1 present on the rig. Whether those algorithms pass values to each other is a question for them. The manifest records what was loaded together.

## Fleet and rollout

Shops have different rigs, different sensors, and uneven connectivity.

| Concern | Position |
| --- | --- |
| Staged rollout | Pins are per shop. V2 goes to one shop, then a few, then all. The hub shows which shop runs which version. |
| Offline shops | The app installs from a local cache. The pin manifest is fetched when online and applied at the next idle moment. A shop never blocks on the registry. |
| Per-rig calibration | Calibration is a parameters artifact pinned per rig, separate from the algorithm version. |
| Deprecation | A version has a sunset date once every shop has moved. The registry keeps the bytes. |

## Evidence quality

One run showing 1.8° against 3.1° is an anecdote. The shop-evidence check in the demo requires one complete run. The real gate is stronger.

- A minimum number of runs across at least two shops before release.
- Variance reported with the mean. A candidate that is better on average and worse in the tail is a different conversation.
- Ground truth stated per algorithm. For balance, that is a second measurement on a reference balancer after the correction is applied. The procedure records it as a result field.
- Baseline runs on the current release collected inside the investigation, so the comparison is same shop, same week, same technician where possible.

## Observability after release

The evidence does not stop at release. Every production call is a future regression row.

- The app logs inputs, outputs, artifact id, confidence, and latency for every call. Logs flow to the hub as runs with status `production`.
- Drift: the distribution of inputs at a shop is compared to the regression set. A shop whose sensors read outside the set is flagged before anyone notices worse results.
- Incident replay: given a bad move at one shop on one day, the hub can name the artifact, show the inputs, and replay the candidate and the release on them.

## MATLAB

Researchers keep MATLAB. The contract is where it meets Python.

| Option | Fits when |
| --- | --- |
| Port to Python by hand, as today | The algorithm is small and the port is the research deliverable |
| MATLAB Compiler SDK, compiled into a Python package | The algorithm is large and stable; the wheel carries a MATLAB runtime |
| MATLAB Engine for Python | Dev only. A licensed MATLAB on the test rig is acceptable for shadow runs; production stays Python |

The useful tool is a parity check: the same measurement rows through the MATLAB original and the Python port, outputs compared within a tolerance. The regression set doubles as the parity set. A port is done when parity holds on every stored run, and that result is attached to the version.

## Researchers stay in their tools

Adoption comes from what the hub gives back, so the first interface for a researcher is a library, with the web UI second.

```python
from hub import Investigation

inv = Investigation("reduce-correction-error")
rows = inv.runs().measurements()          # one DataFrame, every run, contract columns
inv.replay("a81f3e2", against="V1")       # the same check CI runs, from a notebook
inv.candidate("a81f3e2")                  # pin dev to this commit
```

- A template repository for a new algorithm: contract, adapter, tests, CI, starter procedure. One command.
- A CLI that mirrors the library for the shop laptop: `hub run start`, `hub release`.
- Review on algorithm repositories kept light: one approver, tests pass, contract check green. Style and typing as defaults in the template, enforced by tooling.
- Office hours for the first month, and a rule for myself: anything a researcher has to do twice becomes a feature or disappears.

## Technicians

The person recording the run did not write the algorithm and is working on a shop floor.

- A tablet form that works offline and syncs the run folder later.
- Setup fields read from the vehicle and tire where possible: VIN scan, tire barcode, sensor ids from the rig.
- Photos and video taken inside the form land in the run folder at capture time.
- The result of the run is shown to the technician when it completes. That is what makes the next form worth filling.

## Governance

Shop data comes from customer sites.

- Photos and video may contain people and license plates. The run folder has a retention rule and a redaction step before anything leaves the shop.
- Every release and rollback records who, when, and which runs. That is the audit trail if a shop asks what changed.
- Artifacts are hash-pinned and signed. The app refuses a wheel whose hash is not in the manifest.

## Build or buy

Several tools cover parts of this. The hub is thin on purpose and can sit on them.

| Tool | Covers | What it does not know |
| --- | --- | --- |
| MLflow, Weights & Biases | Experiment tracking, model registry | A technician’s run form, shop evidence as a release gate, rig manifests |
| DVC, LakeFS | Data versioning | The algorithm lifecycle |
| Artifactory, Nexus, cloud artifact registries | Storing wheels and images | Which runs justified a version |
| GitHub or GitLab releases | Tags and assets | Everything after the tag |

The reasonable split: a package registry for the bytes, CI for the builds, and the hub for the domain records: algorithm, investigation, run, version, manifest. Tracking tools can be adopted behind the library without changing what a researcher sees.

## Getting from today to this

No big-bang migration.

1. Register each algorithm with the wheel production runs today as V1. No code moves.
2. Give each algorithm a repository, from the template, with the current source as the first commit.
3. The next change to any algorithm goes through a candidate and a replay. The old path stays open for one release cycle.
4. Start the run form on one algorithm at one shop with one technician. Expand when that technician asks for it elsewhere.

## How to know it is working

| Measure | Today | Target |
| --- | --- | --- |
| Lead time from “this works” to a shop running it | Unknown, ask | Days |
| Manual steps in a release | Unknown, ask | One: approve |
| Runs with complete files on the day of the visit | Unknown, ask | All |
| Candidates replayed before touching hardware | Zero | All |
| Time to roll a shop back | Unknown, ask | Minutes |

The first two weeks on the job are for filling the “today” column.
