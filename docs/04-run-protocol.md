# Run protocol and files

A technician who did not write the algorithm can finish this form in the bay. Files land in the run because the run made a place for them.

## Start

```text
Algorithm:      Wheel Balance
Investigation:  Reduce correction error
Tested:         candidate a81f3e2
Procedure:      revision 3

Shop:           [ Woburn Service Center ]
Vehicle:        [            ]
Tire:           [            ]
Sensor A/B/C:   [            ]

[ Confirm setup ]
```

Confirming creates `investigations/reduce-correction-error/runs/018/` with `metadata.json`, `measurements/`, `photos/`, `video/`, `results/`.

## During

```text
wheel_angle     [ 23.4 ]
radial_force    [ 12.7 ]
lateral_force   [  3.2 ]
wheel_speed     [  8.4 ]
[ Record row ]

[ Add CSV ]  [ Add photo ]  [ Add video ]  [ Add note ]
[ Complete run ]
```

## Complete

The hub evaluates the tested artifact on the rows, writes the result, and lists the run on the investigation.

```text
#18  Woburn  candidate a81f3e2   1.8°
#17  Woburn  V1                  3.1°
#16  Boston  V1                  3.4°
```

## File tracking

| Level | Rule | In the demo |
| --- | --- | --- |
| 1 | The investigation has a folder. Anything in it belongs to the investigation. | Yes |
| 2 | Starting a run creates its subfolder. Anything in it belongs to the run. | Yes, seeded |
| 3 | The hub suggests links for files created while a run was open, by time and name. | Roadmap |

Out of scope: live capture, technician accounts, sensor drivers, Drive sync. If video is captured in another app, it is dropped into the run folder once.
