import json
import re
from pathlib import Path

from hub.models import (
    AlgorithmRecord,
    ContractRecord,
    InvestigationRecord,
    Pins,
    ProcedureRecord,
    RunRecord,
    VersionRecord,
)

ROOT = Path(__file__).resolve().parents[1]
PRIMARY_ALGORITHM = "wheel-balance"
PRIMARY_INVESTIGATION = "reduce-correction-error"


class Store:
    def __init__(
        self,
        algorithms: list[AlgorithmRecord],
        procedures: list[ProcedureRecord],
        versions: list[VersionRecord],
        investigations: list[InvestigationRecord],
        runs: list[RunRecord],
        pins: dict[str, Pins],
    ) -> None:
        self._algorithms = {item.id: item for item in algorithms}
        self._procedures = {item.algorithm_id: item for item in procedures}
        self._versions = versions
        self._investigations = {item.id: item for item in investigations}
        self._runs = {run.number: run for run in runs}
        self._pins_by_algorithm = pins
        self._algorithm = self._algorithms[PRIMARY_ALGORITHM]
        self._investigation = self._investigations[PRIMARY_INVESTIGATION]
        self._pins = self._pins_by_algorithm[PRIMARY_ALGORITHM]

    @classmethod
    def load(cls, path: Path | None = None) -> "Store":
        path = path or ROOT / "data" / "seed.json"
        raw = json.loads(path.read_text())
        return cls(
            algorithms=[AlgorithmRecord.model_validate(item) for item in raw["algorithms"]],
            procedures=[ProcedureRecord.model_validate(item) for item in raw["procedures"]],
            versions=[VersionRecord.model_validate(item) for item in raw["versions"]],
            investigations=[InvestigationRecord.model_validate(item) for item in raw["investigations"]],
            runs=[RunRecord.model_validate(item) for item in raw["runs"]],
            pins={key: Pins.model_validate(value) for key, value in raw["pins"].items()},
        )

    def algorithms(self) -> list[AlgorithmRecord]:
        return [item.model_copy(deep=True) for item in self._algorithms.values()]

    def algorithm(self, algorithm_id: str = PRIMARY_ALGORITHM) -> AlgorithmRecord:
        return self._algorithms[algorithm_id].model_copy(deep=True)

    def versions(self, algorithm_id: str = PRIMARY_ALGORITHM) -> list[VersionRecord]:
        return [
            version.model_copy(deep=True)
            for version in self._versions
            if version.algorithm_id == algorithm_id
        ]

    def investigations(self, algorithm_id: str) -> list[InvestigationRecord]:
        return [
            item.model_copy(deep=True)
            for item in self._investigations.values()
            if item.algorithm_id == algorithm_id
        ]

    def investigation(self, investigation_id: str = PRIMARY_INVESTIGATION) -> InvestigationRecord:
        return self._investigations[investigation_id].model_copy(deep=True)

    def procedure(self, algorithm_id: str = PRIMARY_ALGORITHM) -> ProcedureRecord:
        return self._procedures[algorithm_id].model_copy(deep=True)

    def runs(self, investigation_id: str = PRIMARY_INVESTIGATION) -> list[RunRecord]:
        ordered = sorted(
            (run for run in self._runs.values() if run.investigation_id == investigation_id),
            key=lambda run: run.number,
            reverse=True,
        )
        return [run.model_copy(deep=True) for run in ordered]

    def run(self, number: int) -> RunRecord:
        return self._runs[number].model_copy(deep=True)

    def pins(self, algorithm_id: str = PRIMARY_ALGORITHM) -> Pins:
        return self._pins_by_algorithm[algorithm_id].model_copy(deep=True)

    def find_version(self, number: str, algorithm_id: str = PRIMARY_ALGORITHM) -> VersionRecord | None:
        for version in self._versions:
            if version.number == number and version.algorithm_id == algorithm_id:
                return version.model_copy(deep=True)
        return None

    def append_version(self, version: VersionRecord) -> None:
        if self.find_version(version.number) is None:
            self._versions.append(version)

    def set_current_release(self, number: str) -> None:
        self._algorithm.current_release = number

    def mark_investigation(self, status: str, outcome: str) -> None:
        self._investigation.status = status
        self._investigation.outcome = outcome

    def set_prod(self, artifact_id: str) -> None:
        self._pins.prod = artifact_id

    def create_algorithm(self, name: str, repository: str) -> AlgorithmRecord:
        algorithm_id = _unique_id(_slug(name), self._algorithms)
        record = AlgorithmRecord(
            id=algorithm_id,
            name=name.strip(),
            repository=repository.strip(),
            contract=ContractRecord(inputs="Reading", outputs="Result", ranges={}, input_fields=[]),
            current_release="None",
            procedure_revision=1,
        )
        self._algorithms[algorithm_id] = record
        self._procedures[algorithm_id] = ProcedureRecord(
            algorithm_id=algorithm_id,
            revision=1,
            blocks={"setup": [], "measurements": [], "files": [], "result": []},
        )
        artifact = f"{repository.strip()}:1"
        self._pins_by_algorithm[algorithm_id] = Pins(dev=artifact, prod=artifact)
        return record.model_copy(deep=True)

    def create_investigation(self, algorithm_id: str, name: str, owner: str) -> InvestigationRecord:
        if algorithm_id not in self._algorithms:
            raise KeyError(algorithm_id)
        investigation_id = _unique_id(_slug(name), self._investigations)
        record = InvestigationRecord(
            id=investigation_id,
            name=name.strip(),
            algorithm_id=algorithm_id,
            owner=owner.strip() or "Researcher A",
            candidate_commit="",
            candidate_artifact="",
            status="Open",
            outcome="",
            folder=f"investigations/{investigation_id}/",
        )
        self._investigations[investigation_id] = record
        return record.model_copy(deep=True)


def _slug(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "item"


def _unique_id(base: str, existing: dict[str, object]) -> str:
    if base not in existing:
        return base
    number = 2
    while f"{base}-{number}" in existing:
        number += 1
    return f"{base}-{number}"
