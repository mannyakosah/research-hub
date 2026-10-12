# Models

Each box is a record. A line is an association, with how many on each side. It is not a step.

```mermaid
classDiagram
  direction TB
  class Algorithm {
    name: string
    repository: string
    contract: Contract
    currentRelease: Version
    procedure: Procedure
  }
  class Procedure {
    revision: number
    setup: Block
    measurements: Block
    files: Block
    result: Block
  }
  class Version {
    number: string
    commit: string
    artifact: string
    evidence: Run
  }
  class Investigation {
    name: string
    owner: string
    candidate: Commit
    status: Status
  }
  class Run {
    number: number
    procedureRevision: number
    tested: Version or Commit
    correctionError: number
  }
  Procedure "1" -- "1" Algorithm : has
  Algorithm "1" -- "*" Version : has
  Algorithm "1" -- "*" Investigation : has
  Investigation "1" -- "*" Run : has
  Run "*" -- "0..1" Version : tested
```

`1` is one. `*` is zero or more. `0..1` is optional. `tested` is the version or the candidate a run recorded.

`Contract`, `Commit`, `Status`, and `Block` are field types. They are not records.
