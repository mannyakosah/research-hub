# Lifecycle

## An investigation

```text
Open  →  Testing  →  Released
                 ↘  Closed
```

| Status | What is true |
| --- | --- |
| Open | The question is named. No candidate yet. Baseline runs on the current release may be collected. |
| Testing | A candidate commit exists. CI built `wheel-balance:<commit>`. Dev is pinned to it. Runs record it. |
| Released | Checks passed. The candidate artifact was published as the next version. The investigation is done. |
| Closed | Ended without a release. Runs and notes are kept. |

One investigation, at most one release. More work after a release is a new investigation.

## A release

The same bytes move from dev to prod. Nothing is rebuilt between them.

```text
candidate commit → CI builds artifact → dev runs it → checks → published as V2 → prod pinned to V2
```

Publishing does three things:

1. Tags the commit `V2` in the algorithm’s repository and moves the default branch to it.
2. Renames the candidate artifact to `wheel-balance:2`. Same bytes.
3. Sets the algorithm’s current release to V2.

Rollback sets the current release back to V1. V2 stays in the registry.

## Dev and prod

Two environments of the same app.

| Environment | Where | Allowed to call |
| --- | --- | --- |
| Dev | The shop where runs happen | The current release, or one investigation’s candidate artifact |
| Prod | Customer shops | A released version only |

A version number means prod may call it. A candidate never has one.

## Checks before release

| Check | Proves |
| --- | --- |
| Contract | Inputs and outputs match the algorithm’s contract |
| Unit tests | The implementation passes its own tests |
| Regression | Replayed on stored runs, error is no worse than the current release |
| Reproducibility | Same measurement row, same output, every time |
| Shop evidence | At least one complete run tested this candidate |

Regression replays the candidate on measurement rows from earlier runs. The shop record is the test set.
