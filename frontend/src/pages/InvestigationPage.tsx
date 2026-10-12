import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import type { HubContextValue } from "../App";
import { FolderPanel } from "../components/FolderPanel";
import { PromotionDetail } from "../components/PromotionDetail";
import { isStepId, PromotionRail, promotionState } from "../components/PromotionRail";
import { RecordHeader } from "../components/RecordHeader";
import { Stat } from "../components/Stat";
import { StatusBadge } from "../components/StatusBadge";
import { useInvestigation } from "../hooks/useInvestigation";
import { glossary } from "../lib/glossary";

export function InvestigationPage() {
  const { algorithm } = useOutletContext<HubContextValue>();
  const params = useParams();
  const algorithmId = params.algorithmId ?? "";
  const investigationId = params.investigationId ?? "";
  const investigation = useInvestigation(algorithmId, investigationId);
  const [searchParams, setSearchParams] = useSearchParams();
  if (investigation.loading) return <p className="loading">Loading…</p>;
  if (investigation.error) return <p className="error">Request failed ({investigation.error})</p>;
  if (!investigation.data) return null;
  const record = investigation.data.investigation;
  const runs = investigation.data.runs;
  const versions = algorithm.data?.versions ?? [];
  const prodPin = algorithm.data?.pins.prod ?? "";
  const liveRelease = algorithmId === "wheel-balance" && record.id === "reduce-correction-error";
  const progress = promotionState({
    status: record.status,
    hasCompleteRun: runs.some((run) => run.status === "Complete"),
    versions,
    investigationId: record.id,
    prodPin,
    hasCandidate: Boolean(record.candidate_commit),
  });
  const requested = searchParams.get("step");
  const selected = isStepId(requested) ? requested : (progress.current ?? "question");

  return (
    <article className="page investigation-page">
      <RecordHeader
        kind="Investigation"
        title={record.name}
        sentence={glossary.investigation}
        tone="investigation"
        extra={<StatusBadge status={record.status} />}
      />
      <div className="stat-row">
        <Stat label="Owner" value={record.owner} tone="investigation" />
        <Stat label="Candidate" value={record.candidate_commit || "None"} tone="algorithm" />
        <Stat label="Runs" value={String(runs.length)} tone="run" />
      </div>
      {prodPin && (
        <PromotionRail
          investigationName={record.name}
          status={record.status}
          hasCompleteRun={runs.some((run) => run.status === "Complete")}
          versions={versions}
          investigationId={record.id}
          prodPin={prodPin}
          hasCandidate={Boolean(record.candidate_commit)}
          selected={selected}
          onSelect={(step) => setSearchParams({ step }, { replace: true })}
        />
      )}
      {prodPin && (
        <PromotionDetail
          step={selected}
          algorithmId={algorithmId}
          investigationId={record.id}
          investigationName={record.name}
          status={record.status}
          owner={record.owner}
          commit={record.candidate_commit}
          artifact={record.candidate_artifact}
          outcome={record.outcome}
          runs={runs}
          versions={versions}
          procedure={algorithm.data?.procedure}
          prodPin={prodPin}
          devPin={algorithm.data?.pins.dev ?? ""}
          currentRelease={algorithm.data?.algorithm.current_release ?? ""}
          investigations={algorithm.data?.investigations ?? []}
          liveRelease={liveRelease}
          reloadAlgorithm={algorithm.reload}
          reloadInvestigation={investigation.reload}
        />
      )}
      <FolderPanel
        algorithmId={algorithmId}
        investigationId={record.id}
        folder={record.folder}
        repository={algorithm.data?.algorithm.repository ?? ""}
        commit={record.candidate_commit}
      />
    </article>
  );
}
