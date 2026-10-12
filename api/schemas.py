from typing import Literal

from pydantic import BaseModel

from contract.types import SensorFrame
from hub.models import (
    AlgorithmRecord,
    CheckResult,
    InvestigationRecord,
    Pins,
    PredictResult,
    ProcedureRecord,
    ReleaseOutcome,
    RunRecord,
    VersionRecord,
)
from hub.files import FolderFile, RunFile


class InvestigationSummary(BaseModel):
    id: str
    name: str
    status: str
    owner: str
    candidate_commit: str
    has_complete_run: bool


class AlgorithmSummary(BaseModel):
    id: str
    name: str
    investigations: list[InvestigationSummary]


class AlgorithmPayload(BaseModel):
    algorithm: AlgorithmRecord
    versions: list[VersionRecord]
    procedure: ProcedureRecord
    pins: Pins
    investigations: list[InvestigationSummary]


class InvestigationPayload(BaseModel):
    investigation: InvestigationRecord
    runs: list[RunRecord]


class RunFolder(BaseModel):
    number: int
    files: list[RunFile]


class InvestigationFolder(BaseModel):
    folder: str
    files: list[FolderFile]
    runs: list[RunFolder]


class RollbackPayload(BaseModel):
    pins: Pins
    current_release: str


class CreatedRecord(BaseModel):
    id: str


class CreateAlgorithmBody(BaseModel):
    name: str
    repository: str


class CreateInvestigationBody(BaseModel):
    name: str
    owner: str = "Researcher A"


class PredictBody(BaseModel):
    environment: Literal["dev", "prod"]
    inputs: SensorFrame


__all__ = [
    "AlgorithmPayload",
    "AlgorithmSummary",
    "InvestigationSummary",
    "CheckResult",
    "InvestigationFolder",
    "InvestigationPayload",
    "PredictBody",
    "PredictResult",
    "ReleaseOutcome",
    "RollbackPayload",
    "RunFile",
]
