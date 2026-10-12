import pytest
from fastapi.testclient import TestClient

from api.main import create_app

SAMPLE = {
    "radial_force": 12.4,
    "lateral_force": 3.1,
    "wheel_angle": 27.2,
    "wheel_speed": 8.3,
}


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_reads_the_seeded_story(client: TestClient) -> None:
    algorithm = client.get("/api/algorithms/wheel-balance")
    assert algorithm.status_code == 200
    body = algorithm.json()
    assert body["algorithm"]["name"] == "Wheel Balance"
    assert body["algorithm"]["current_release"] == "V1"

    investigation = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error")
    assert investigation.status_code == 200
    payload = investigation.json()
    assert payload["investigation"]["status"] == "Testing"
    assert [run["correction_error"] for run in payload["runs"]] == [1.8, 3.1, 3.4]

    run = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error/runs/18")
    assert run.status_code == 200
    assert "Woburn" in run.json()["setup"]["shop"]

    folder = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error/files")
    assert folder.status_code == 200
    filed = {item["name"]: item for item in folder.json()["files"]}
    assert filed["notes.md"]["kind"] == "note"
    assert filed["notes.md"]["origin"] == "Copied in from a document kept outside the repository."
    assert filed["lateral-split.m"]["kind"] == "matlab"
    assert "MATLAB" in filed["lateral-split.m"]["origin"]
    assert [item["number"] for item in folder.json()["runs"]] == [18, 17, 16]
    note = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error/files/notes.md")
    assert note.status_code == 200
    assert b"a81f3e2" in note.content
    hidden = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error/files/origins.json")
    assert hidden.status_code == 404

    catalog = client.get("/api/algorithms")
    assert catalog.status_code == 200
    by_algorithm = {item["name"]: [inv["name"] for inv in item["investigations"]] for item in catalog.json()}
    assert by_algorithm["Wheel Balance"] == ["Reduce correction error", "Sensor mount swap"]
    assert by_algorithm["Tread Depth"] == ["Estimate remaining miles", "Gauge check"]
    assert by_algorithm["Road Force"] == ["Reduce variation at the shoulder", "Match the OEM spec"]
    tread = client.get("/api/algorithms/tread-depth")
    assert tread.status_code == 200
    assert [item["artifact_id"] for item in tread.json()["versions"]] == ["tread-depth:1"]
    assert tread.json()["pins"] == {"dev": "tread-depth:1", "prod": "tread-depth:1"}

    created = client.post(
        "/api/algorithms/tread-depth/investigations",
        json={"name": "Shoulder groove", "owner": "Researcher B"},
    )
    assert created.status_code == 200
    assert created.json()["id"] == "shoulder-groove"
    listed = client.get("/api/algorithms/tread-depth").json()["investigations"]
    assert listed[-1]["name"] == "Shoulder groove"
    assert listed[-1]["status"] == "Open"

    blank = client.post("/api/algorithms", json={"name": "  ", "repository": "x"})
    assert blank.status_code == 400
    algorithm = client.post("/api/algorithms", json={"name": "Bead Seat", "repository": "bead-seat"})
    assert algorithm.status_code == 200
    assert algorithm.json()["id"] == "bead-seat"
    opened = client.get("/api/algorithms/bead-seat")
    assert opened.status_code == 200
    assert opened.json()["algorithm"]["current_release"] == "None"
    assert opened.json()["investigations"] == []

    files = client.get("/api/algorithms/wheel-balance/investigations/reduce-correction-error/runs/18/files")
    names = {item["name"] for item in files.json()}
    assert {"sensor-data.csv", "setup.png", "result.png", "pass.txt", "note.txt"} <= names


def test_release_predict_and_rollback(client: TestClient) -> None:
    released = client.post("/api/algorithms/wheel-balance/release")
    assert released.status_code == 200
    body = released.json()
    assert all(item["passed"] for item in body["checks"])
    assert client.get("/api/algorithms/wheel-balance").json()["algorithm"]["current_release"] == "V2"

    prod = client.post("/api/algorithms/wheel-balance/predict", json={"environment": "prod", "inputs": SAMPLE})
    assert prod.status_code == 200
    assert prod.json()["artifact_id"] == "wheel-balance:2"

    rejected = client.post(
        "/api/algorithms/wheel-balance/predict?artifact=wheel-balance:a81f3e2",
        json={"environment": "prod", "inputs": SAMPLE},
    )
    assert rejected.status_code == 409
    assert rejected.json() == {"error": "not_released"}

    rolled = client.post("/api/algorithms/wheel-balance/rollback")
    assert rolled.status_code == 200
    assert client.get("/api/environments").json()["prod"] == "wheel-balance:1"
