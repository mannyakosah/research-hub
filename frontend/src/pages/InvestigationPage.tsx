import { useOutletContext, useParams } from "react-router-dom";
import type { HubContextValue } from "../App";
import { CandidateCard } from "../components/CandidateCard";
import { FolderPanel } from "../components/FolderPanel";
import { PromotionRail } from "../components/PromotionRail";
import { RecordHeader } from "../components/RecordHeader";
import { ReleasePanel } from "../components/ReleasePanel";
import { RunComparison } from "../components/RunComparison";
import { SectionBlock } from "../components/SectionBlock";
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
  if (investigation.loading) return <p className="loading">Loading…</p>;
  if (investigation.error) return <p className="error">Request failed ({investigation.error})</p>;
  if (!investigation.data) return null;
  const record = investigation.data.investigation;
  const runs = investigation.data.runs;
  const versions = algorithm.data?.versions ?? [];
  const prodPin = algorithm.data?.pins.prod ?? "";
  const published = versions.find((version) => version.from_investigation === record.id);
  const liveRelease = algorithmId === "wheel-balance" && record.id === "reduce-correction-error";

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
        />
      )}
      <div className="split">
        <CandidateCard
          commit={published?.commit || record.candidate_commit}
          artifact={published?.artifact_id || record.candidate_artifact}
          status={record.status}
          published={record.outcome || (published ? `Released as ${published.number}` : undefined)}
        />
        {liveRelease ? (
          <ReleasePanel
            status={record.status}
            candidateCommit={record.candidate_commit}
            candidateArtifact={record.candidate_artifact}
            reloadAlgorithm={algorithm.reload}
            reloadInvestigation={investigation.reload}
            reloadEnvironments={algorithm.reload}
          />
        ) : (
          <SectionBlock tone="version" kind="Release" sentence={glossary.release}>
            {record.status === "Closed" && <p>{record.outcome}</p>}
            {record.status === "Released" && <p>{record.outcome || "This candidate was published."}</p>}
            {record.status === "Open" && (
              <p>No candidate is pinned yet. A release publishes a candidate after the checks pass.</p>
            )}
            {record.status === "Testing" && (
              <p>Dev can run this candidate. This demo runs the release checks on Wheel Balance.</p>
            )}
          </SectionBlock>
        )}
      </div>
      <FolderPanel
        algorithmId={algorithmId}
        investigationId={record.id}
        folder={record.folder}
        repository={algorithm.data?.algorithm.repository ?? ""}
        commit={record.candidate_commit}
      />
      <RunComparison algorithmId={algorithmId} investigationId={record.id} runs={runs} />
    </article>
  );
}
