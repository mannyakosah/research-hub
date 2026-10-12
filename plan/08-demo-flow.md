# Demo flow

The click path walks a story that is already finished. `/` redirects to Wheel Balance. The only investigation id is hard-coded. The store holds one investigation. Release is the only write. A visitor cannot see how a question becomes a run, or how a run becomes a version.

This phase makes that path something you do. Stretch waits until this flow is obvious on screen.

The names stay. An investigation is one question. A candidate is a commit, never a version number. A version is created only by release. The procedure is the blank run form on the algorithm. Dev and prod stay two pins. New investigations and new runs live in the same in-memory store as the seed. Restarting the API restores the seed.

## What a visitor should be able to do

1. Land on the hub and see Wheel Balance as one algorithm, with its current release.
2. Open Wheel Balance and see previous versions and previous runs, not only the one investigation.
3. Create an investigation. It starts Open: a name, an owner, no candidate.
4. On that investigation, pin the candidate `a81f3e2`. Status becomes Testing. Dev points at `wheel-balance:a81f3e2`. Only one investigation may be Testing. If dev is already taken, the button explains that and does not move the pin.
5. Prepare a run from procedure revision 3. Confirming setup creates the next run number and its folder.
6. Record one measurement row and complete the run. The hub calls the artifact under test and writes the error. An Open investigation tests the current release. A Testing investigation tests the candidate.
7. Release, on the Testing investigation, still runs the five checks and publishes V2 as the same object. The promotion rail moves with it. Rollback still returns prod to V1 and leaves V2 in the list.

Seeded runs #16, #17, and #18 stay Complete and read-only. Creating a run does not edit them.

## Routes

| Path | Page |
| --- | --- |
| `/` | `HubPage` |
| `/algorithms/wheel-balance` | `AlgorithmPage` |
| `/algorithms/wheel-balance/investigations/new` | `NewInvestigationPage` |
| `/algorithms/wheel-balance/investigations/:id` | `InvestigationPage` |
| `/algorithms/wheel-balance/investigations/:id/runs/new` | `PrepareRunPage` |
| `/algorithms/wheel-balance/investigations/:id/runs/:number` | `RunPage` |

Unknown paths still redirect to `/`. The hard-coded `reduce-correction-error` route goes away. That investigation is reached by its id like any other.

`AppShell` keeps the pin bar. It adds a left rail: Hub, Wheel Balance, and the investigations returned by the API. The rail is how the extra pages stay visible. The work surface is the page, not a second copy of the navigation.

## Say what it is

A visitor who was not in the design conversation should be able to read any page and say what kind of thing they are looking at, and what that kind means. The title "Reduce correction error" is the name of one investigation. It is not a label that says "investigation".

Two pieces do this. Both are always visible for the first use on a page. A tooltip repeats the same sentence where the word shows up again.

`RecordHeader` is the top of every page and every section that is one of the five records.

- Eyebrow, small caps: the kind. `Investigation`, `Version`, `Run`, `Algorithm`, `Procedure`.
- The glossary sentence sits on the same line as that kind.
- Title, below the kind: the name of this one. `Reduce correction error`, `V2`, `Run #18`, `Wheel Balance`. The sentence does not sit under the name.

`Term` wraps a repeated word: Candidate, Version, Dev, Prod, Artifact, Tested, Contract, Current release. The word has a dotted underline. Hover or keyboard focus opens a note with the glossary sentence. The first time that word is the subject of a section, the sentence is also printed under the section header, so the page still explains itself if nobody hovers.

The glossary is the only copy. A tooltip and a header that talk about the same word use the same sentence.

| Term | Sentence |
| --- | --- |
| Research Hub | Records an algorithm from shop tests through to a released version. |
| Algorithm | Code the SmartBay app calls to move one part of the rig. It lives in one git repository, with a contract, a procedure, released versions, and investigations. |
| Current release | The version prod is pinned to. |
| Repository | The git repository that holds this algorithm's source. The hub stores the name; the code stays in git. |
| Contract | The inputs the algorithm accepts and the outputs it must return, with an allowed range on each output. |
| Version | An immutable release of an algorithm. The next release is a new version, not a change to the previous one. |
| Investigation | One researcher's question about an algorithm. It has one candidate and produces at most one version. |
| Candidate | The commit under test. It is built into an artifact, pinned in dev, and given a version number only at release. |
| Procedure | The blank form a technician fills in for a shop visit. The technician did not write the algorithm. A form change is a new revision. |
| Run | One shop visit: a filled procedure revision, including the version or candidate that was on the rig. |
| Tested | The version or candidate loaded on the rig for this visit. |
| Artifact | The built package the app executes, produced from a git commit. |
| Dev | The shop environment. It runs the current release or the one candidate under test. |
| Prod | The customer environment. It runs a released version only. |
| Pin | The artifact an environment is set to execute. |
| Release | Publishes the candidate as the next version, using the same bytes the shop ran, and points prod at that version. |
| Checks | Five gates. A candidate becomes a version only when all five pass. |
| Open | The investigation is named and has no candidate yet. |
| Testing | A candidate is pinned in dev, and shop runs can record it. |
| Released | The candidate was published as a version. The investigation is finished. |
| Closed | The investigation ended without a release. Its runs are kept. |
| correction error | The difference, in degrees, between the commanded correction angle and the measured wheel angle. |

Status badges use `Term` with the Open, Testing, Released, and Closed sentences. The pin chips use Dev and Prod. Column headers Tested, Artifact, and Version use `Term`.

## Promotion rail

`PromotionRail` sits at the top of the algorithm page and the investigation page. Six steps, top to bottom on a narrow screen and in a row when there is room:

1. Question — an investigation exists
2. Candidate — status is Testing or Released
3. Shop runs — at least one Complete run
4. Checks — the five checks, filled in after release
5. Version — a version whose `from_investigation` is this investigation
6. Prod — the prod pin equals that version's artifact

Each step is done, current, or waiting, and each step is a button. Choosing one shows that step under the rail. The shop-run step shows the procedure. A visit that was not recorded is labeled as an example. Release still writes only on Wheel Balance, Reduce correction error. The rail is a view of records that already exist. It is not a new record.

Under the rail, one line names the step that is current, in a full sentence:

| Current step | Line |
| --- | --- |
| Question | This investigation is the question. It has no candidate yet. |
| Candidate | Dev is running this candidate. Prod is still on the current release. |
| Shop runs | These visits are the evidence. A complete run records what was on the rig. |
| Checks | Release runs five checks. Prod moves only if all five pass. |
| Version | This candidate is now a version. The bytes are the ones the shop ran. |
| Prod | Prod is pinned to that version. |

## Pages

### `HubPage`

`RecordHeader`: eyebrow `Research Hub`, title `Algorithms`, sentence from the glossary. One card, Wheel Balance, eyebrow `Algorithm` and the algorithm sentence. The card shows the repository, the current release, the count of investigations, and the count of runs, each label a `Term`. The card links to the algorithm page.

### `AlgorithmPage`

- `RecordHeader`: eyebrow `Algorithm`, title `Wheel Balance`, the algorithm sentence.
- Repository, current release, contract, and predict stay. Each block starts with its glossary sentence printed once.
- `PromotionRail` for the investigation that is Testing, or for the latest Released one if none is Testing. The rail's own line says which investigation it is describing: "Showing Reduce correction error."
- `InvestigationList`, eyebrow `Investigations`, the investigation sentence, then every investigation with status, owner, and candidate or "No candidate". A button, New investigation.
- `RunHistory`, eyebrow `Runs`, the run sentence. Every run, newest first: investigation name, shop, tested, error. Each row links to its run.
- `VersionTable`, eyebrow `Versions`, the version sentence.

### `NewInvestigationPage`

`RecordHeader`: eyebrow `New investigation`, title `Name the question`, the investigation sentence, then a second sentence: "It starts Open. Pinning a candidate comes after this, and that is what lets the shop run unreleased code." Fields: name, owner. Owner defaults to Researcher A. Submit `POST`s and navigates to the new investigation. No commit field on this page.

### `InvestigationPage`

Loads by `:id`.

- `RecordHeader`: eyebrow `Investigation`, title the question's name, the investigation sentence. Owner and `StatusBadge` sit under that. The badge's tooltip is the status sentence.
- `PromotionRail`, with the line for the current step.
- `CandidateCard`, eyebrow `Candidate` and the candidate sentence, when a candidate exists. When status is Open, the same header, then commit `a81f3e2`, artifact `wheel-balance:a81f3e2`, and the button "Pin candidate". Beside the button: "Dev will run this artifact. Prod stays on the current release." If another investigation is already Testing, the button is disabled and the copy names that investigation.
- When status is Released, the candidate block says "Released as V2" and keeps the version sentence under it.
- `RunComparison`, eyebrow `Runs`, the run sentence, then this investigation's runs. Button "Prepare a run" unless status is Released. The button's subtext: "A run is one shop visit. The form is the procedure."
- `ReleasePanel`, eyebrow `Release`, the release sentence, only when status is Testing or Released. A new Open investigation does not offer release. Above the button, the checks sentence.

### `PrepareRunPage`

`RecordHeader`: eyebrow `Procedure`, title `Prepare a run`, the procedure sentence. Under it, the run sentence, and "This visit will test {tested}." Tested is the current release on an Open investigation, and the candidate on a Testing investigation. Revision 3 is shown as `Term` text: "Revision 3. A later change to the form would be revision 4. This run keeps 3."

- Shown, not edited: algorithm, investigation, procedure revision, and tested. Each label is a `Term`.
- Edited: shop, vehicle, tire, sensors. Shop is a select of Boston Service Center and Woburn Service Center.
- Confirm setup creates the run, status Open, no measurements yet, and opens the run page. The button reads "Confirm setup". Subtext: "This creates the run and its folder. Measurements come next."

### `RunPage`

`RecordHeader`: eyebrow `Run`, title `Run #{number}`, the run sentence. A second line: "Part of the investigation {name}. Tested {tested}."

Complete runs then show setup, measurements, files, and result. Each of those blocks has a one-line caption: "Setup, filled at the start." "Measurements, the contract inputs." "Files, stored because this run made a folder for them." "Result, written when the run was completed." The error figure is labeled `correction error` with its glossary sentence.

An Open run renders the during form under the setup:

- Four inputs: `wheel_angle`, `radial_force`, `lateral_force`, `wheel_speed`. One row is enough.
- A note field. Saving writes `note.txt` into the run folder.
- One file input. The file is stored under the run folder. Kind comes from the suffix, the same rule as `list_run_files`.
- Complete run. The server runs the tested artifact on the row, writes `output` and `correction_error`, and sets status Complete. The page then shows `ResultBlock`.

No camera, no sensor driver, no second row editor. The form is the protocol, filled by hand.

## API

The algorithm payload gains `investigations` and `runs`, so the algorithm page can list both without a second round trip.

| Method | Path | Effect |
| --- | --- | --- |
| `GET` | `/algorithms` | `[{ id, name, current_release }]` |
| `POST` | `/algorithms/wheel-balance/investigations` | body `{ name, owner }` → the new investigation |
| `POST` | `.../investigations/:id/candidate` | pins `a81f3e2`, status Testing. `409` if dev is already held by another investigation |
| `POST` | `.../investigations/:id/runs` | body is the setup form → the new Open run |
| `POST` | `.../runs/:number/measurements` | one `SensorFrame` |
| `POST` | `.../runs/:number/files` | multipart file, or JSON `{ note }` |
| `POST` | `.../runs/:number/complete` | calls the registry, writes the result |

`GET` routes for an investigation and a run take the id from the path instead of the hard-coded slug. Release and rollback stay where they are.

Ids for a new investigation are the name in kebab case, plus a short suffix if that id exists. Run numbers continue from 18.

## Store

`_investigation` becomes `_investigations: dict[str, InvestigationRecord]`. Reads keep returning copies. New methods, used only by the routes above:

- `create_investigation(name, owner) -> InvestigationRecord`
- `pin_candidate(investigation_id) -> InvestigationRecord`
- `create_run(investigation_id, setup) -> RunRecord`
- `add_measurement(number, frame) -> RunRecord`
- `complete_run(number, output, error) -> RunRecord`

`pin_candidate` refuses when some other investigation has status Testing. It sets `candidate_commit` to `a81f3e2`, `candidate_artifact` to `wheel-balance:a81f3e2`, status to Testing, and `pins.dev` to that artifact. It does not invent a second algorithm. A commit other than `a81f3e2` is not accepted in this phase, because the registry has no build for it.

`create_run` copies `procedure.revision`, chooses tested from the investigation status, and creates `data/files/investigations/<id>/runs/<number>/` with `metadata.json` and the empty `measurements/`, `photos/`, `video/`, and `results/` directories.

`complete_run` is refused when the run is already Complete, and when it has no measurement row.

## Hooks

Same shape as the existing read hooks: `{ data, error, loading, reload }`. Writes return the created record and then call the reloads the page was given.

| Hook | Role |
| --- | --- |
| `useAlgorithms` | hub page |
| `useInvestigation(id)` | one investigation |
| `useCreateInvestigation` | the new-investigation form |
| `usePinCandidate` | the Open investigation panel |
| `useCreateRun` | confirm setup |
| `useCompleteRun` | the during form |

`useAlgorithm`, `useEnvironments`, `useRelease`, and `useRollback` stay. Release still reloads the algorithm, the investigation, and the environments, and now the run history on the algorithm page because that hook is the same `useAlgorithm`.

## Looks

The information is the same. The page should read as a shop tool, not a document of tables.

- The shell is a dark bar (`#1e1e1e`) across the top and a light canvas (`#f4f1ea`) under it. The left rail is on the canvas, not a second dark column.
- Record color is a solid header on each section, not only a border. Algorithm and procedure `#3dadff` on `#e8f6ff`. Version `#1d7a32` on `#e5f6e8`. Investigation `#8a6a00` on `#fff4d6`. Run `#9a4e00` on `#fff0e4`. Text on those headers is `#1e1e1e`.
- Titles use a serif face loaded from the page (`Source Serif 4`). The eyebrow above a title is small caps in the sans face. The definition sentence under a title is sans, one size smaller, in `#3f3a33`. Labels, tables, and ids use the system sans and the system monospace. Artifact ids stay in `code`.
- A `Term` underline is a dotted `#5c564c` border. The note is a light panel with a 1px border, the same sentence as the glossary, opened on hover and on focus. It is not the browser's default tooltip.
- The current release and a run's error are large figures. Supporting fields stay in a definition list.
- Tables keep their columns. Row height, alignment, and the section header do the work. No card grid of metrics, no gradient, no component library.
- The promotion rail is the one ornamental piece: six labeled nodes, a line between them, the current node filled with its record color.
- Forms use the same type and the same borders as the tables. The primary button is the dark bar color. A disabled button says why next to it.
- The narrow layout stacks the rail under the title and turns the left navigation into a row of links. The pin chips wrap, as they do now.

## Tests

`tests/test_flow.py` covers the writes without the browser.

- A created investigation is Open, has no candidate, and appears in the algorithm's list.
- Pinning the candidate sets Testing and moves dev. A second pin while one investigation is Testing returns 409 and leaves the pin.
- Confirming setup adds run 19, status Open, tested against the current release when the investigation is Open.
- Completing that run stores the V1 error for its row. The run is Complete. Runs 16–18 are unchanged.
- Release of the seeded investigation still publishes the same object and moves prod to `wheel-balance:2`.

The browser pass, after the API tests, is the visitor list above: create, pin, prepare, complete, then the existing release on the seeded investigation, then look back at the hub and see the new run in the history.

## Out of this phase

A second algorithm. A commit the registry cannot build. Editing a Complete run. Accounts. Live capture from the rig. The stretch list: lineage, shadow mode, a wheel file, a manifest, the library call, and the variance sentence. Those stay in [07-stretch.md](07-stretch.md), after this flow is on screen.
