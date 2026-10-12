# Domain model

Five records. Everything in the hub is one of these.

```text
Algorithm            one part of the rig, one git repository
├── Procedure        the run form for this algorithm
├── Versions         V1, V2 … each is a release
└── Investigations   one question at a time
    └── Runs         one shop visit each
```

An algorithm outlives any question. An investigation is a chapter of work on it. A run is one visit to the shop inside that chapter.

The same five records, with their fields, are drawn as a class diagram in [models](models.md).

## Algorithm

| Field | Example |
| --- | --- |
| Name | Wheel Balance |
| Repository | `wheel-balance`, one git repository for this algorithm |
| Contract | `SensorFrame` in, `BalanceCorrection` out |
| Current release | V1 |
| Procedure | revision 3 |

The contract is the production interface. Inputs:

| Field | Meaning in the demo |
| --- | --- |
| `radial_force` | Force at the wheel, radial |
| `lateral_force` | Force at the wheel, lateral |
| `wheel_angle` | Current angle |
| `wheel_speed` | Current speed |

Outputs:

| Field | Meaning in the demo |
| --- | --- |
| `correction_angle` | Angle to command |
| `correction_weight` | Balance weight |
| `lateral_adjustment` | Lateral correction |
| `confidence` | How much to trust this output |

Field names are placeholders for a real sensor contract.

## Version

A release of one algorithm. Immutable. V1 is never edited into V2.

| Field | Example |
| --- | --- |
| Number | V2 |
| Algorithm | Wheel Balance |
| Commit | `a81f3e2` |
| Artifact | `wheel-balance:2` |
| From investigation | Reduce correction error |
| Evidence | Run #18 |
| Released by, at | Researcher A, when the checks passed |

The artifact is what production calls. The commit is what the artifact was built from.

## Investigation

One question about one algorithm, worked by one researcher, ending in at most one release.

| Field | Example |
| --- | --- |
| Name | Reduce correction error |
| Algorithm | Wheel Balance |
| Owner | Researcher A |
| Candidate | commit `a81f3e2`, built as `wheel-balance:a81f3e2` |
| Status | Testing |
| Outcome | empty, then Released as V2 or Closed |
| Folder | `investigations/reduce-correction-error/` |

The candidate is the commit under test. CI builds an artifact from it so dev can run it. The folder holds notes and analysis. Code stays in the algorithm’s repository.

Statuses: **Open** (no candidate yet), **Testing** (candidate pinned in dev), **Released** (candidate became the next version), **Closed** (ended without a release).

## Procedure

The run form for an algorithm. A technician who did not write the algorithm fills it in. Changing the form creates a new revision. Old runs keep theirs.

| Field | Example |
| --- | --- |
| Algorithm | Wheel Balance |
| Revision | 3 |

The form has four blocks.

| Block | Fields | When |
| --- | --- | --- |
| Setup | Shop, Vehicle, Tire, Sensor configuration | Once, at the start |
| Measurements | `wheel_angle`, `radial_force`, `lateral_force`, `wheel_speed` | One row per reading |
| Files | Measurement CSV, Photos, Video, Note | During the visit |
| Result | `correction_error`, plus the four contract outputs | Written on completion |

Measurement fields match the contract inputs. That is what lets a later candidate be replayed on old runs.

## Run

One shop visit. A filled copy of the procedure, recording what was on the rig.

| Field | Example |
| --- | --- |
| Number | 18 |
| Investigation | Reduce correction error |
| Procedure revision | 3 |
| Tested | candidate `a81f3e2` |
| Technician | recorded on the run |
| Date | 2026-10-12 |
| Status | Complete |
| Setup | Woburn Service Center, vehicle, tire, sensors |
| Measurements | rows of the four input fields |
| Files | `sensor-data.csv`, 2 photos, 1 video, note |
| `correction_error` | 1.8° |

**Tested** is either a version or the investigation’s candidate. Runs #16 and #17 tested V1 and are the baseline. Run #18 tested the candidate.

| | Run #16 | Run #17 | Run #18 |
| --- | --- | --- | --- |
| Shop | Boston | Woburn | Woburn |
| Tested | V1 | V1 | candidate `a81f3e2` |
| `correction_error` | 3.4° | 3.1° | 1.8° |

Files land in `investigations/reduce-correction-error/runs/018/`. The run creates that folder when it starts, so filing is a side effect of doing the visit.

## Adding things

**A new algorithm.** Create the record, create its repository from a template that includes the contract, adapter, CI, and a starter procedure. Its first release is V1.

**A new investigation.** Pick the algorithm, name the question. A folder is created. Work until there is a candidate, then test it in the shop.

**A new version.** Only by releasing an investigation’s candidate.
