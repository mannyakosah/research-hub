# Stretch

Only after the click path works once. In this order.

## 1. Lineage

One more component on `AlgorithmPage`, under `VersionTable`, shown for V2.

`Lineage` reads the V2 record and renders one vertical list, top to bottom:

- Version V2, artifact `wheel-balance:2`
- Commit `a81f3e2`, same object as `wheel-balance:a81f3e2`
- Investigation Reduce correction error
- Evidence run #18
- Procedure revision 3
- Regression rows: runs 16 and 17

No new endpoint. The algorithm payload already has versions, and the investigation payload has the runs. Pass both into the component.

## 2. Shadow mode

Dev runs both functions on run 18's row and shows both errors. The "actuated" value is V1.

`hub/shadow.py`

```python
def shadow(store, registry, run_number: int) -> ShadowResult:
    """Run pins.prod's released artifact and the candidate on the run's rows.
    Return both outputs and both errors. actuated = the released artifact."""
```

`GET /algorithms/wheel-balance/investigations/.../runs/18/shadow`

`ShadowTable` on `RunPage`, under the result, only when the run's tested kind is candidate. Two columns, V1 and candidate, errors 3.6 and 1.8 on run 18's row (lateral force 3.6). A line: "Dev logged both. The rig followed V1."

`useShadow(runNumber)` fetches when the run is a candidate run.

## 3. A real wheel

```python
# registry/wheel.py
def build_wheel(artifact_id: str) -> Path:
    """Zip the algorithm module and contract types into dist/wheel_balance-<id>.whl.
    Record the file's sha256 on the registry entry."""
```

Call it once at startup for `:1` and `:a81f3e2`. `publish_same_bytes` copies the candidate file's hash onto `:2` and copies the file to `dist/wheel_balance-2.whl` without running the algorithm module through a build again. The copy can rewrite the version string in the filename. The sha256 the hub stores is the hash of the candidate file, and the UI shows that both ids share it.

Hold `dist/wheel_balance-2.whl` up if someone asks what production installs. One sentence: the version string inside a real wheel's metadata would be rewritten without rebuilding the code. The demo copies the file.

## 4. Manifest

Not a sixth record in the demo store. One file, `data/manifest.json`:

```json
{ "rig": "smartbay-2", "algorithms": { "wheel-balance": "1", "bead-seat": "5", "runout": "1" } }
```

`GET /manifest` returns it. After release, the response shows wheel-balance `"2"` if `release` also writes that field. Bead-seat and runout are names only. They have no code.

`ManifestCard` on `AlgorithmPage`. One line under it: "A run of wheel-balance records this list, so the other versions on the rig stay with the result." Run 18's seed gains `manifest` copied from the file at startup, with wheel-balance still `"1"` because the run happened before release. Do not rewrite history on release.

## 5. Library snippet

`hub/library.py`, used from a notebook or a `python -c` in the README. Not a screen.

```python
class Investigation:
    def __init__(self, investigation_id: str): ...
    def runs(self) -> RunQuery: ...

class RunQuery:
    def measurements(self) -> list[dict]:
        """One dict per row, contract columns only, across every run."""
```

README shows:

```python
from hub.library import Investigation
Investigation("reduce-correction-error").runs().measurements()
```

That is the researcher-facing interface from `docs/06-beyond-the-demo.md`. The web UI stays the demo.

## 6. Variance

`hub/checks.py` gains `summarize(errors) -> { n, mean, spread }` where spread is max − min. On runs 16 and 17 the detail string is "n=2, candidate mean 1.65, V1 mean 3.25". `CheckList` already renders `detail`. On the investigation page, one sentence under `RunComparison`: "Three runs. One shop visit is an anecdote. The gate wants a mean and a spread across shops."

No chart.
