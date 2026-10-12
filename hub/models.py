from typing import Literal

from pydantic import BaseModel

from contract.types import BalanceCorrection, SensorFrame


class FieldRange(BaseModel):
    min: float
    max: float


class ContractRecord(BaseModel):
    inputs: str
    outputs: str
    ranges: dict[str, FieldRange]
    input_fields: list[str] = []


class AlgorithmRecord(BaseModel):
    id: str
    name: str
    repository: str
    contract: ContractRecord
    current_release: str
    procedure_revision: int


class VersionRecord(BaseModel):
    number: str
    algorithm_id: str
    commit: str
    artifact_id: str
    from_investigation: str | None
    evidence_run: int | None
    released_by: str
    released_at: str


class InvestigationRecord(BaseModel):
    id: str
    name: str
    algorithm_id: str
    owner: str
    candidate_commit: str
    candidate_artifact: str
    status: str
    outcome: str
    folder: str


class ProcedureRecord(BaseModel):
    algorithm_id: str
    revision: int
    blocks: dict[str, list[str]]


class Tested(BaseModel):
    kind: Literal["version", "candidate"]
    number: str | None = None
    commit: str | None = None


class Setup(BaseModel):
    shop: str
    vehicle: str
    tire: str
    sensors: list[str]


class RunRecord(BaseModel):
    number: int
    investigation_id: str
    procedure_revision: int
    tested: Tested
    technician: str
    date: str
    status: str
    setup: Setup
    measurements: list[SensorFrame]
    correction_error: float
    output: BalanceCorrection
    folder: str


class Pins(BaseModel):
    dev: str
    prod: str


class CheckResult(BaseModel):
    name: str
    passed: bool
    detail: str


class ReleaseOutcome(BaseModel):
    checks: list[CheckResult]
    released: bool
    version: VersionRecord | None
    pins: Pins


class PredictResult(BaseModel):
    environment: Literal["dev", "prod"]
    artifact_id: str
    version: str | None
    output: BalanceCorrection
