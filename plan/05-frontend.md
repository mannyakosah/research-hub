# Frontend

Five clicks, three pages. Release and predict are panels on those pages, not extra routes. The server is the source of truth. Hooks refetch after a write. No client cache library.

## Routes

| Path | Page | Demo beat |
| --- | --- | --- |
| `/algorithms/wheel-balance` | `AlgorithmPage` | Wheel Balance, V1, contract. Predict lives here |
| `/algorithms/wheel-balance/investigations/reduce-correction-error` | `InvestigationPage` | Candidate, status, run list, Release |
| `/algorithms/wheel-balance/investigations/reduce-correction-error/runs/:number` | `RunPage` | Run #18, then back to the list |

`App.tsx` renders `AppShell` and a router. Unknown paths redirect to the algorithm page.

## `AppShell`

Top bar: "Research Hub", the algorithm name as a link home, `PinBar`.

`PinBar` reads `useEnvironments`. Two chips: `Dev` and the artifact id, `Prod` and the artifact id. After release the prod chip changes from `wheel-balance:1` to `wheel-balance:2` without a reload of the whole app, because `release` refetches environments.

## Pages

### `AlgorithmPage`

- Title Wheel Balance. Repository `wheel-balance`. Current release from `useAlgorithm`, so it changes from V1 to V2 after release.
- `ContractTable`: four inputs, four outputs, the ranges.
- `VersionTable`: number, commit, artifact, evidence run. One row until release, then V2.
- `PredictPanel` at the bottom.

### `InvestigationPage`

- Title Reduce correction error. Owner Researcher A. `StatusBadge`.
- `CandidateCard`: commit `a81f3e2`, artifact `wheel-balance:a81f3e2`, one line that the folder holds notes and the repo holds code.
- `RunComparison`: three rows, #18 #17 #16, shop, tested, error. #18 links to the run page. After release, nothing in this list changes. The runs stay historical.
- `ReleasePanel`.

### `RunPage`

Reads `useRun(number)`.

- Header: number, shop, date, tested, procedure revision, status.
- `SetupBlock`: shop, vehicle, tire, sensors.
- `MeasurementTable`: the rows.
- `FileList`: csv, photos, video, note. Each name is a link to the file URL.
- `ResultBlock`: `correction_error` and the four outputs.

Runs 16 and 17 render the same page with fewer files. The script only opens 18. The list is what shows 16 and 17.

## Components

| Component | Props | Renders |
| --- | --- | --- |
| `PinBar` | `dev`, `prod` | two chips |
| `ContractTable` | `contract` | inputs, outputs, ranges |
| `VersionTable` | `versions` | one row per version, evidence run as a link |
| `StatusBadge` | `status` | Open, Testing, Released, Closed |
| `CandidateCard` | `commit`, `artifact`, `status` | the candidate. Hidden once status is Released, replaced by "Released as V2" |
| `RunComparison` | `runs` | the three-row list |
| `SetupBlock` | `setup` | definition list |
| `MeasurementTable` | `rows` | the four contract inputs |
| `FileList` | `files`, `runNumber` | links |
| `ResultBlock` | `error`, `output` | 1.8° and the four numbers |
| `CheckList` | `checks` | five rows, pass or fail, the detail string |
| `ReleasePanel` | none, uses hooks | the button, then the checklist, then rollback |
| `PredictPanel` | none, uses hooks | environment select, the sample inputs, the four outputs |

`ReleasePanel` states:

1. Before: button "Release". Copy: checks run against the candidate, and prod moves only if all five pass.
2. Pending: button disabled.
3. After success: `CheckList` all passed, "Prod is pinned to wheel-balance:2. V1 is still in the registry." Button "Roll back to V1".
4. After rollback: prod chip back to `:1`, V2 still in `VersionTable`.

`PredictPanel` states:

- Environment defaults to prod.
- Inputs filled with the sample frame: 12.4, 3.1, 27.2, 8.3.
- Submit calls `usePredict`. The result shows artifact id, version or "candidate", and the four outputs.
- Switching the select to dev and submitting shows the candidate id and confidence 0.94.
- The panel does not offer an artifact id field. The pin is the point.

## `src/api/client.ts`

```ts
getAlgorithm(): Promise<AlgorithmPayload>
getInvestigation(): Promise<InvestigationPayload>
getRun(number: number): Promise<RunPayload>
getRunFiles(number: number): Promise<RunFile[]>
fileUrl(number: number, path: string): string
release(): Promise<ReleasePayload>
rollback(): Promise<PinsPayload>
predict(environment: "dev" | "prod", inputs: SensorFrame): Promise<PredictPayload>
getEnvironments(): Promise<PinsPayload>
```

`types.ts` mirrors `api/schemas.py`. One shape each. Parse failures throw with the status code.

## Hooks

Each read hook: `{ data, error, loading, reload }`. Load on mount. `reload` is how writes refresh the pages that are already open.

| Hook | Fetches | Extra |
| --- | --- | --- |
| `useAlgorithm` | `getAlgorithm` | `reload` after release and rollback |
| `useInvestigation` | `getInvestigation` | includes the run list |
| `useRun(number)` | `getRun` and `getRunFiles` | |
| `useEnvironments` | `getEnvironments` | `PinBar` and both panels |
| `useRelease` | none until called | `{ release, pending, result, error }`. `release()` posts, then calls the reload callbacks passed in |
| `useRollback` | none until called | `{ rollback, pending, error }` |
| `usePredict` | none until called | `{ submit, pending, result, error }`. `submit(environment, inputs)` |

`ReleasePanel` passes `useAlgorithm().reload`, `useInvestigation().reload`, and `useEnvironments().reload` into `useRelease`, so one click updates the current release, the badge, the version table, and the prod chip.

No context and no global store. Three pages, the props are the wiring.

## Styles

One `styles.css`. System font. Status colors: blue for the algorithm and the procedure, green for a version, yellow for the investigation, orange for a run. The page background stays neutral. No component library.

## Empty and error

Seeded pages are never empty. A failed fetch shows the status code. The release button stays disabled while `pending` is true. A failed check list renders red rows and does not change pins. The seed is built so the happy path passes.
