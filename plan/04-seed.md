# Seed

`data/seed.json` is the metadata. `data/files/` is the run folders. The store computes nothing at load except file sizes. Errors in the JSON match what replay produces, so a mismatch fails `test_story`.

## How the story numbers fall out

`correction_error` = round(abs(`correction_angle` − `wheel_angle`), 1).

V1 sets `correction_angle` = `wheel_angle` + `lateral_force`, so its error equals `lateral_force`.
The candidate sets `correction_angle` = `wheel_angle` + `lateral_force` * 0.5, so its error is half.

| Run | Shop | Tested | `lateral_force` | Error |
| --- | --- | --- | --- | --- |
| 16 | Boston Service Center | V1 | 3.4 | 3.4° |
| 17 | Woburn Service Center | V1 | 3.1 | 3.1° |
| 18 | Woburn Service Center | candidate `a81f3e2` | 3.6 | 1.8° |

One measurement row per run is enough. Other fields, same on every row: `radial_force` 12.4, `wheel_angle` 27.2, `wheel_speed` 8.3. Those match the sample predict body, so a predict on prod before release (V1, lateral 3.1) returns a correction angle of 30.3 and confidence 0.86.

Derived outputs the UI can show after replay, and that the seed may store on the run as the written result:

| | V1 on 16 | V1 on 17 | Candidate on 18 |
| --- | --- | --- | --- |
| `correction_angle` | 30.6 | 30.3 | 29.0 |
| `correction_weight` | 1.2 | 1.2 | 1.2 |
| `lateral_adjustment` | -0.34 | -0.31 | -0.36 |
| `confidence` | 0.86 | 0.86 | 0.94 |
| `correction_error` | 3.4 | 3.1 | 1.8 |

Regression on runs 16 and 17 under the candidate: errors 1.7 and 1.6, both under V1. The check compares means on those rows. It does not compare run 18 to run 17 inside the check. The comparison list on the investigation page is the human version of that.

## Records

Algorithm, procedure revision 3, investigation status Testing, one version V1.

V1: number `V1`, commit `b10c44d`, artifact `wheel-balance:1`, from_investigation null, evidence_run null, released_by `Researcher A`.

Runs:

| | 16 | 17 | 18 |
| --- | --- | --- | --- |
| Date | 2026-10-05 | 2026-10-08 | 2026-10-12 |
| Status | Complete | Complete | Complete |
| Procedure revision | 3 | 3 | 3 |
| Technician | recorded on the run | recorded on the run | recorded on the run |
| Vehicle | 2019 Camry | 2021 F-150 | 2021 F-150 |
| Tire | 225/45R17 | 275/65R18 | 275/65R18 |
| Sensors | A, B, C | A, B, C | A, B, C |

Setup text can be short. It has to be present so the run page is not empty.

Pins: dev `wheel-balance:a81f3e2`, prod `wheel-balance:1`.

## Folders

```text
data/files/investigations/reduce-correction-error/
  notes.md                                          a few lines of researcher notes
  runs/016/metadata.json
  runs/016/measurements/sensor-data.csv
  runs/017/metadata.json
  runs/017/measurements/sensor-data.csv
  runs/018/metadata.json
  runs/018/measurements/sensor-data.csv
  runs/018/photos/setup.png                         a tiny valid png
  runs/018/photos/result.png
  runs/018/video/pass.txt                           placeholder, listed as video
  runs/018/note.txt
  runs/018/results/result.json                      the four outputs and 1.8
```

`metadata.json` repeats number, tested, shop, procedure revision. The CSV header is `wheel_angle,radial_force,lateral_force,wheel_speed` and one data row. The run page reads the API, and the file list shows these names. Opening the CSV shows the row the replay used.

Investigation folder is level 1. Run subfolders are level 2. Nothing suggests files (level 3).
