from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from api.schemas import (
    AlgorithmPayload,
    AlgorithmSummary,
    CreateAlgorithmBody,
    CreateInvestigationBody,
    CreatedRecord,
    InvestigationFolder,
    InvestigationPayload,
    InvestigationSummary,
    PredictBody,
    RollbackPayload,
    RunFolder,
)
from hub.files import (
    FILES_ROOT,
    list_investigation_files,
    list_run_files,
    resolve_investigation_file,
    resolve_run_file,
)
from hub.predict import NotReleased, predict
from hub.release import release, rollback
from hub.store import Store
from registry.registry import Registry, seed_registry


def create_app(store: Store | None = None, registry: Registry | None = None) -> FastAPI:
    app = FastAPI(title="Research Hub")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.store = store or Store.load()
    app.state.registry = registry or seed_registry()

    def _summary(store: Store, investigation) -> InvestigationSummary:
        runs = store.runs(investigation.id)
        return InvestigationSummary(
            id=investigation.id,
            name=investigation.name,
            status=investigation.status,
            owner=investigation.owner,
            candidate_commit=investigation.candidate_commit,
            has_complete_run=any(run.status == "Complete" for run in runs),
        )

    def _algorithm_payload(store: Store, algorithm_id: str) -> AlgorithmPayload:
        try:
            algorithm = store.algorithm(algorithm_id)
            procedure = store.procedure(algorithm_id)
            pins = store.pins(algorithm_id)
        except KeyError:
            raise HTTPException(status_code=404, detail="algorithm not found") from None
        investigations = store.investigations(algorithm_id)
        return AlgorithmPayload(
            algorithm=algorithm,
            versions=store.versions(algorithm_id),
            procedure=procedure,
            pins=pins,
            investigations=[_summary(store, item) for item in investigations],
        )

    def _investigation_or_404(store: Store, algorithm_id: str, investigation_id: str):
        try:
            investigation = store.investigation(investigation_id)
        except KeyError:
            raise HTTPException(status_code=404, detail="investigation not found") from None
        if investigation.algorithm_id != algorithm_id:
            raise HTTPException(status_code=404, detail="investigation not found")
        return investigation

    @app.post("/api/algorithms", response_model=CreatedRecord)
    def post_algorithm(body: CreateAlgorithmBody) -> CreatedRecord:
        name = body.name.strip()
        repository = body.repository.strip()
        if not name or not repository:
            raise HTTPException(status_code=400, detail="name and repository are required")
        created = app.state.store.create_algorithm(name, repository)
        return CreatedRecord(id=created.id)

    @app.post("/api/algorithms/{algorithm_id}/investigations", response_model=CreatedRecord)
    def post_investigation(algorithm_id: str, body: CreateInvestigationBody) -> CreatedRecord:
        name = body.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="name is required")
        try:
            created = app.state.store.create_investigation(algorithm_id, name, body.owner)
        except KeyError:
            raise HTTPException(status_code=404, detail="algorithm not found") from None
        return CreatedRecord(id=created.id)

    @app.get("/api/algorithms", response_model=list[AlgorithmSummary])
    def get_algorithms() -> list[AlgorithmSummary]:
        store = app.state.store
        return [
            AlgorithmSummary(
                id=algorithm.id,
                name=algorithm.name,
                investigations=[_summary(store, item) for item in store.investigations(algorithm.id)],
            )
            for algorithm in store.algorithms()
        ]

    @app.get("/api/algorithms/{algorithm_id}", response_model=AlgorithmPayload)
    def get_algorithm(algorithm_id: str) -> AlgorithmPayload:
        return _algorithm_payload(app.state.store, algorithm_id)

    @app.get(
        "/api/algorithms/{algorithm_id}/investigations/{investigation_id}",
        response_model=InvestigationPayload,
    )
    def get_investigation(algorithm_id: str, investigation_id: str) -> InvestigationPayload:
        store = app.state.store
        investigation = _investigation_or_404(store, algorithm_id, investigation_id)
        return InvestigationPayload(investigation=investigation, runs=store.runs(investigation_id))

    @app.get(
        "/api/algorithms/{algorithm_id}/investigations/{investigation_id}/files",
        response_model=InvestigationFolder,
    )
    def get_investigation_folder(algorithm_id: str, investigation_id: str) -> InvestigationFolder:
        store = app.state.store
        investigation = _investigation_or_404(store, algorithm_id, investigation_id)
        runs = store.runs(investigation_id)
        return InvestigationFolder(
            folder=investigation.folder,
            files=list_investigation_files(FILES_ROOT / investigation.folder),
            runs=[
                RunFolder(number=run.number, files=list_run_files(FILES_ROOT / run.folder)) for run in runs
            ],
        )

    @app.get("/api/algorithms/{algorithm_id}/investigations/{investigation_id}/files/{name}")
    def get_investigation_file(algorithm_id: str, investigation_id: str, name: str):
        investigation = _investigation_or_404(app.state.store, algorithm_id, investigation_id)
        try:
            target = resolve_investigation_file(investigation.folder, name)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="file not found") from None
        return FileResponse(target)

    @app.get("/api/algorithms/{algorithm_id}/investigations/{investigation_id}/runs/{number}")
    def get_run(algorithm_id: str, investigation_id: str, number: int):
        _investigation_or_404(app.state.store, algorithm_id, investigation_id)
        try:
            run = app.state.store.run(number)
        except KeyError:
            raise HTTPException(status_code=404, detail="run not found") from None
        if run.investigation_id != investigation_id:
            raise HTTPException(status_code=404, detail="run not found")
        return run

    @app.get("/api/algorithms/{algorithm_id}/investigations/{investigation_id}/runs/{number}/files")
    def get_run_files(algorithm_id: str, investigation_id: str, number: int):
        _investigation_or_404(app.state.store, algorithm_id, investigation_id)
        try:
            run = app.state.store.run(number)
        except KeyError:
            raise HTTPException(status_code=404, detail="run not found") from None
        if run.investigation_id != investigation_id:
            raise HTTPException(status_code=404, detail="run not found")
        return list_run_files(FILES_ROOT / run.folder)

    @app.get(
        "/api/algorithms/{algorithm_id}/investigations/{investigation_id}/runs/{number}/files/{path:path}"
    )
    def get_run_file(algorithm_id: str, investigation_id: str, number: int, path: str):
        _investigation_or_404(app.state.store, algorithm_id, investigation_id)
        try:
            run = app.state.store.run(number)
            if run.investigation_id != investigation_id:
                raise KeyError(number)
            target = resolve_run_file(run.folder, path)
        except (KeyError, FileNotFoundError):
            raise HTTPException(status_code=404, detail="file not found") from None
        return FileResponse(target)

    @app.post("/api/algorithms/wheel-balance/release")
    def post_release():
        return release(app.state.store, app.state.registry)

    @app.post("/api/algorithms/wheel-balance/rollback", response_model=RollbackPayload)
    def post_rollback() -> RollbackPayload:
        pins = rollback(app.state.store, app.state.registry)
        return RollbackPayload(pins=pins, current_release=app.state.store.algorithm().current_release)

    @app.post("/api/algorithms/wheel-balance/predict")
    def post_predict(body: PredictBody, artifact: str | None = Query(default=None)):
        try:
            return predict(
                app.state.store,
                app.state.registry,
                body.environment,
                body.inputs,
                artifact_id=artifact,
            )
        except NotReleased:
            return JSONResponse(status_code=409, content={"error": "not_released"})

    @app.get("/api/environments")
    def get_environments():
        return app.state.store.pins()

    return app


app = create_app()
