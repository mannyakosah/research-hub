import pytest
from pydantic import ValidationError

from contract.types import SensorFrame
from hub.predict import NotReleased, assert_allowed, predict
from hub.release import release, rollback
from hub.store import Store
from registry.registry import seed_registry

SAMPLE = SensorFrame(
    radial_force=12.4,
    lateral_force=3.1,
    wheel_angle=27.2,
    wheel_speed=8.3,
)


def test_release_publishes_the_same_object_and_rollback_keeps_v2() -> None:
    store = Store.load()
    registry = seed_registry()

    assert store.pins().prod == "wheel-balance:1"
    assert store.pins().dev == "wheel-balance:a81f3e2"
    assert [version.number for version in store.versions()] == ["V1"]
    assert store.investigation().status == "Testing"
    assert predict(store, registry, "prod", SAMPLE).artifact_id == "wheel-balance:1"
    assert predict(store, registry, "dev", SAMPLE).artifact_id == "wheel-balance:a81f3e2"
    with pytest.raises(NotReleased):
        assert_allowed("prod", "wheel-balance:a81f3e2", store)

    outcome = release(store, registry)
    assert all(item.passed for item in outcome.checks)
    assert len(outcome.checks) == 5
    assert registry.same_object("wheel-balance:a81f3e2", "wheel-balance:2")
    assert store.algorithm().current_release == "V2"
    assert store.pins().prod == "wheel-balance:2"
    assert store.pins().dev == "wheel-balance:a81f3e2"
    assert store.investigation().status == "Released"
    assert [version.number for version in store.versions()] == ["V1", "V2"]

    prod = predict(store, registry, "prod", SAMPLE)
    assert prod.artifact_id == "wheel-balance:2"
    assert prod.output.confidence == 0.94

    pins = rollback(store, registry)
    assert pins.prod == "wheel-balance:1"
    assert store.algorithm().current_release == "V1"
    assert registry.same_object("wheel-balance:a81f3e2", "wheel-balance:2")
    assert [version.number for version in store.versions()] == ["V1", "V2"]
    assert store.investigation().status == "Released"

    again = release(store, registry)
    assert again.version is not None
    assert again.version.number == "V2"
    assert [version.number for version in store.versions()] == ["V1", "V2"]


def test_sample_frame_is_a_valid_contract_input() -> None:
    assert SAMPLE.wheel_speed == 8.3
    with pytest.raises(ValidationError):
        SensorFrame(radial_force=12.4, lateral_force=3.1, wheel_angle=27.2)
