import { Link, useParams } from "react-router-dom";
import { FileList } from "../components/FileList";
import { MeasurementTable } from "../components/MeasurementTable";
import { RecordHeader } from "../components/RecordHeader";
import { ResultBlock } from "../components/ResultBlock";
import { SetupBlock } from "../components/SetupBlock";
import { Stat } from "../components/Stat";
import { useInvestigation } from "../hooks/useInvestigation";
import { useRun } from "../hooks/useRun";
import { testedLabel } from "../lib/format";
import { glossary } from "../lib/glossary";

export function RunPage() {
  const params = useParams();
  const algorithmId = params.algorithmId ?? "";
  const investigationId = params.investigationId ?? "";
  const number = Number(params.number);
  const runState = useRun(algorithmId, investigationId, number);
  const investigation = useInvestigation(algorithmId, investigationId);
  if (!Number.isInteger(number)) return <p className="error">Request failed (404)</p>;
  if (runState.loading) return <p className="loading">Loading…</p>;
  if (runState.error) return <p className="error">Request failed ({runState.error})</p>;
  if (!runState.data) return null;
  const { run, files } = runState.data;
  const investigationName = investigation.data?.investigation.name ?? investigationId;
  return (
    <article className="page run-page">
      <p className="back-link">
        <Link to={`/algorithms/${algorithmId}/investigations/${investigationId}`}>Back to the investigation</Link>
      </p>
      <RecordHeader
        kind="Run"
        title={`Run #${run.number}`}
        sentence={glossary.run}
        tone="run"
      />
      <p className="instance-note">Part of {investigationName}.</p>
      <div className="stat-row">
        <Stat label="Shop" value={run.setup.shop} tone="run" />
        <Stat label="Tested" value={testedLabel(run.tested)} sentence={glossary.tested} tone="algorithm" />
        <Stat label="Correction error" value={`${run.correction_error}°`} sentence={glossary.correctionError} tone="version" />
        <Stat
          label="Procedure"
          value={`Revision ${run.procedure_revision}`}
          sentence={glossary.procedure}
          tone="investigation"
        />
      </div>
      <div className="split">
        <SetupBlock setup={run.setup} />
        <ResultBlock error={run.correction_error} output={run.output} />
      </div>
      <MeasurementTable rows={run.measurements} />
      <FileList files={files} algorithmId={algorithmId} investigationId={investigationId} runNumber={run.number} />
    </article>
  );
}
