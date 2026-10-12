import hashlib
import inspect

from algorithms.wheel_balance.algorithm import Algorithm, WheelBalanceCandidate, WheelBalanceV1


class Registry:
    def __init__(self) -> None:
        self._artifacts: dict[str, Algorithm] = {}

    def register(self, artifact_id: str, algorithm: Algorithm) -> None:
        self._artifacts[artifact_id] = algorithm

    def get(self, artifact_id: str) -> Algorithm:
        try:
            return self._artifacts[artifact_id]
        except KeyError:
            raise KeyError(artifact_id) from None

    def publish_same_bytes(self, source_id: str, release_id: str) -> None:
        """Point release_id at the object already stored under source_id."""
        self._artifacts[release_id] = self.get(source_id)

    def same_object(self, a: str, b: str) -> bool:
        """True when both ids are the identical Python object."""
        return self.get(a) is self.get(b)

    def hash_of(self, artifact_id: str) -> str:
        algorithm = self.get(artifact_id)
        source = inspect.getsource(type(algorithm))
        digest = hashlib.sha256(f"{type(algorithm).__name__}:{source}".encode()).hexdigest()
        return digest[:12]


def seed_registry() -> Registry:
    registry = Registry()
    registry.register("wheel-balance:1", WheelBalanceV1())
    registry.register("wheel-balance:a81f3e2", WheelBalanceCandidate())
    return registry
