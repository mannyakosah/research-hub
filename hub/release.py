from datetime import datetime, timezone

from hub.checks import run_checks
from hub.models import Pins, ReleaseOutcome, VersionRecord
from hub.store import Store
from registry.registry import Registry


def release(store: Store, registry: Registry) -> ReleaseOutcome:
    """Run the checks. When all pass, publish V2 from the candidate object."""
    existing = store.find_version("V2")
    checks = run_checks(store, registry)
    if existing is not None:
        return ReleaseOutcome(checks=checks, released=True, version=existing, pins=store.pins())
    if not all(item.passed for item in checks):
        return ReleaseOutcome(checks=checks, released=False, version=None, pins=store.pins())

    registry.publish_same_bytes("wheel-balance:a81f3e2", "wheel-balance:2")
    investigation = store.investigation()
    store.append_version(
        VersionRecord(
            number="V2",
            algorithm_id=investigation.algorithm_id,
            commit=investigation.candidate_commit,
            artifact_id="wheel-balance:2",
            from_investigation=investigation.id,
            evidence_run=18,
            released_by=investigation.owner,
            released_at=datetime.now(timezone.utc).isoformat(),
        )
    )
    store.set_current_release("V2")
    store.mark_investigation("Released", "Released as V2")
    store.set_prod("wheel-balance:2")
    return ReleaseOutcome(
        checks=checks,
        released=True,
        version=store.find_version("V2"),
        pins=store.pins(),
    )


def rollback(store: Store, _registry: Registry) -> Pins:
    """Point current release and the prod pin back at V1. Leave V2 in the registry."""
    v1 = store.find_version("V1")
    if v1 is None:
        raise RuntimeError("V1 is missing")
    store.set_current_release("V1")
    store.set_prod(v1.artifact_id)
    return store.pins()
