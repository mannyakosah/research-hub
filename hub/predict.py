from typing import Literal

from contract.types import SensorFrame
from hub.models import PredictResult
from hub.store import Store
from registry.registry import Registry


class NotReleased(Exception):
    pass


def assert_allowed(environment: str, artifact_id: str, store: Store) -> None:
    """Prod + an id with no version number raises NotReleased."""
    released = {version.artifact_id for version in store.versions()}
    if environment == "prod" and artifact_id not in released:
        raise NotReleased(artifact_id)
    if environment == "dev":
        allowed = released | {store.investigation().candidate_artifact}
        if artifact_id not in allowed:
            raise NotReleased(artifact_id)


def predict(
    store: Store,
    registry: Registry,
    environment: Literal["dev", "prod"],
    frame: SensorFrame,
    artifact_id: str | None = None,
) -> PredictResult:
    """Resolve the pin for that environment, call registry.get(pin).run(frame)."""
    pins = store.pins()
    chosen = artifact_id or (pins.dev if environment == "dev" else pins.prod)
    assert_allowed(environment, chosen, store)
    output = registry.get(chosen).run(frame)
    version = next((item.number for item in store.versions() if item.artifact_id == chosen), None)
    return PredictResult(
        environment=environment,
        artifact_id=chosen,
        version=version,
        output=output,
    )
