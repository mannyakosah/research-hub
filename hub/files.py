import json
from pathlib import Path

from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
FILES_ROOT = ROOT / "data" / "files"
_HIDDEN = {"metadata.json", "origins.json"}


class RunFile(BaseModel):
    name: str
    kind: str
    path: str
    size: int


class FolderFile(RunFile):
    origin: str


def _kind(path: Path) -> str:
    if path.suffix == ".csv":
        return "csv"
    if path.suffix in {".png", ".jpg", ".jpeg"}:
        return "photo"
    if "video" in path.parts:
        return "video"
    if path.suffix in {".txt", ".md"}:
        return "note"
    if path.suffix == ".m":
        return "matlab"
    return "other"


def list_run_files(folder: Path) -> list[RunFile]:
    """Name, kind (csv, photo, video, note), relative path, byte size."""
    files: list[RunFile] = []
    if not folder.is_dir():
        return files
    for path in sorted(folder.rglob("*")):
        if not path.is_file() or path.name == "metadata.json":
            continue
        relative = path.relative_to(folder).as_posix()
        files.append(RunFile(name=path.name, kind=_kind(path), path=relative, size=path.stat().st_size))
    return files


def list_investigation_files(folder: Path) -> list[FolderFile]:
    """Top-level notes and analysis. Run subfolders are listed separately."""
    if not folder.is_dir():
        return []
    origins: dict[str, str] = {}
    origin_path = folder / "origins.json"
    if origin_path.is_file():
        loaded = json.loads(origin_path.read_text())
        if isinstance(loaded, dict):
            origins = {str(key): str(value) for key, value in loaded.items()}
    files: list[FolderFile] = []
    for path in sorted(folder.iterdir()):
        if not path.is_file() or path.name in _HIDDEN:
            continue
        files.append(
            FolderFile(
                name=path.name,
                kind=_kind(path),
                path=path.name,
                size=path.stat().st_size,
                origin=origins.get(path.name, ""),
            )
        )
    return files


def resolve_investigation_file(folder: str, name: str) -> Path:
    if "/" in name or name in _HIDDEN or name.startswith("."):
        raise FileNotFoundError(name)
    return resolve_run_file(folder, name)


def resolve_run_file(folder: str, relative: str) -> Path:
    root = (FILES_ROOT / folder).resolve()
    target = (root / relative).resolve()
    if not target.is_relative_to(root) or not target.is_file():
        raise FileNotFoundError(relative)
    return target
