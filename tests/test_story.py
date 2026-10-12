from contract.types import SensorFrame
from algorithms.wheel_balance.score import correction_error
from hub.store import Store
from registry.registry import seed_registry


def _replay(artifact_id: str, frame: SensorFrame) -> float:
    output = seed_registry().get(artifact_id).run(frame)
    return correction_error(output, frame)


def test_replay_matches_the_stored_story_errors() -> None:
    store = Store.load()
    expected = {
        16: ("wheel-balance:1", 3.4),
        17: ("wheel-balance:1", 3.1),
        18: ("wheel-balance:a81f3e2", 1.8),
    }
    for number, (artifact_id, error) in expected.items():
        run = store.run(number)
        assert _replay(artifact_id, run.measurements[0]) == error
        assert run.correction_error == error


def test_candidate_is_lower_than_v1_on_the_baseline_rows() -> None:
    store = Store.load()
    for number in (16, 17):
        frame = store.run(number).measurements[0]
        v1 = _replay("wheel-balance:1", frame)
        candidate = _replay("wheel-balance:a81f3e2", frame)
        assert candidate < v1
