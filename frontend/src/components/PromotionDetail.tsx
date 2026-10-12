import { Fragment } from "react";
import type { InvestigationSummary, ProcedureRecord, RunRecord, Setup, VersionRecord } from "../api/types";
import { glossary } from "../lib/glossary";
import { CandidateCard } from "./CandidateCard";
import { ReleasePanel } from "./ReleasePanel";
import { RunComparison } from "./RunComparison";
import { SectionBlock } from "./SectionBlock";
import type { StepId } from "./PromotionRail";

const GATES = [
  ["Contract", "The candidate's outputs match the contract."],
  ["Unit tests", "The candidate stays in range, and the same input returns the same output."],
  ["Regression", "On stored visits, the candidate's mean error is no higher than the current release."],
  ["Reproducibility", "Running the candidate twice on one row returns the same output."],
  ["Shop evidence", "At least one complete visit tested this candidate."],
];

const SAMPLE_SETUP: Record<string, string> = {
  shop: "Woburn Service Center",
  vehicle: "2019 Camry",
  tire: "225/45R17",
  sensors: "A, B, C",
};

const SAMPLE_MEASUREMENT: Record<string, string> = {
  wheel_angle: "27.2",
  radial_force: "12.4",
  lateral_force: "3.6",
  wheel_speed: "8.3",
};

export function PromotionDetail({
  step,
  algorithmId,
  investigationId,
  investigationName,
  status,
  owner,
  commit,
  artifact,
  outcome,
  runs,
  versions,
  procedure,
  prodPin,
  devPin,
  currentRelease,
  investigations,
  liveRelease,
  reloadAlgorithm,
  reloadInvestigation,
}: {
  step: StepId;
  algorithmId: string;
  investigationId: string;
  investigationName: string;
  status: string;
  owner: string;
  commit: string;
  artifact: string;
  outcome: string;
  runs: RunRecord[];
  versions: VersionRecord[];
  procedure?: ProcedureRecord;
  prodPin: string;
  devPin: string;
  currentRelease: string;
  investigations: InvestigationSummary[];
  liveRelease: boolean;
  reloadAlgorithm: () => void;
  reloadInvestigation: () => void;
}) {
  const published = versions.find((version) => version.from_investigation === investigationId);

  return (
    <div id="promotion-detail">
      {step === "question" && (
        <SectionBlock tone="investigation" kind="Question" title={investigationName} sentence={glossary.investigation}>
          <p>Owner {owner}.</p>
          <p>{statusSentence(status, outcome)}</p>
        </SectionBlock>
      )}
      {step === "candidate" && (
        <CandidateStep
          commit={published?.commit || commit}
          artifact={published?.artifact_id || artifact}
          status={status}
          published={outcome || (published ? `Released as ${published.number}` : undefined)}
          devPin={devPin}
          currentRelease={currentRelease}
          holder={investigations.find((item) => item.status === "Testing" && item.id !== investigationId)}
        />
      )}
      {step === "runs" && (
        <>
          <ProcedurePreview procedure={procedure} runs={runs} />
          <RunComparison algorithmId={algorithmId} investigationId={investigationId} runs={runs} />
        </>
      )}
      {step === "checks" && (
        <>
          <SectionBlock tone="version" kind="Checks" sentence={glossary.checks}>
            <ul className="check-list">
              {GATES.map(([name, detail]) => (
                <li key={name} className="waiting">
                  <span>Gate</span>
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            {!liveRelease && (
              <p>This demo runs these checks on Wheel Balance. Release would publish the candidate and point prod at the artifact the shop ran.</p>
            )}
          </SectionBlock>
          {liveRelease && (
            <ReleasePanel
              status={status}
              candidateCommit={commit}
              candidateArtifact={artifact}
              reloadAlgorithm={reloadAlgorithm}
              reloadInvestigation={reloadInvestigation}
              reloadEnvironments={reloadAlgorithm}
            />
          )}
        </>
      )}
      {step === "version" && (
        <SectionBlock
          tone="version"
          kind="Version"
          title={published?.number}
          sentence={glossary.version}
        >
          {published ? (
            <p>
              Commit <code>{published.commit}</code> was published as <code>{published.artifact_id}</code>.
            </p>
          ) : (
            <p>
              A version appears here when release publishes the candidate. The artifact is the one the shop ran. Prod
              stays on {currentRelease} until then.
            </p>
          )}
        </SectionBlock>
      )}
      {step === "prod" && (
        <SectionBlock tone="version" kind="Prod" title={prodPin} sentence={glossary.prod}>
          {published && prodPin === published.artifact_id ? (
            <p>That pin is this investigation's version.</p>
          ) : (
            <p>Prod stays on this pin until release publishes the candidate and points prod at that version.</p>
          )}
        </SectionBlock>
      )}
    </div>
  );
}

function CandidateStep({
  commit,
  artifact,
  status,
  published,
  devPin,
  currentRelease,
  holder,
}: {
  commit: string;
  artifact: string;
  status: string;
  published?: string;
  devPin: string;
  currentRelease: string;
  holder?: InvestigationSummary;
}) {
  if (commit) {
    return (
      <>
        <CandidateCard commit={commit} artifact={artifact} status={status} published={published} />
        {status === "Testing" && (
          <p className="step-note">
            Dev is pinned to <code>{devPin}</code>. Prod stays on {currentRelease} until release.
          </p>
        )}
        {status === "Closed" && artifact !== devPin && (
          <p className="step-note">
            This commit is not the one dev is running. Dev is pinned to <code>{devPin}</code>.
          </p>
        )}
      </>
    );
  }
  return (
    <SectionBlock tone="investigation" kind="Candidate" title="None" sentence={glossary.candidate}>
      {holder ? (
        <p>
          Dev is already running <code>{holder.candidate_commit}</code> for {holder.name}. This question can be pinned
          when that investigation releases or closes. Prod stays on {currentRelease}.
        </p>
      ) : (
        <p>
          Dev would pin the artifact built from the candidate commit. This demo does not build it. Prod stays on{" "}
          {currentRelease}.
        </p>
      )}
    </SectionBlock>
  );
}

function ProcedurePreview({ procedure, runs }: { procedure?: ProcedureRecord; runs: RunRecord[] }) {
  const setupFields = procedure?.blocks.setup ?? [];
  const measurementFields = procedure?.blocks.measurements ?? [];
  const visit = runs.reduce<RunRecord | undefined>((latest, run) => {
    if (run.status !== "Complete") return latest ?? run;
    if (!latest || latest.status !== "Complete" || run.number > latest.number) return run;
    return latest;
  }, undefined);
  return (
    <SectionBlock
      tone="run"
      kind="Procedure"
      title={procedure ? `Revision ${procedure.revision}` : undefined}
      sentence={glossary.procedure}
    >
      {setupFields.length === 0 && measurementFields.length === 0 && (
        <p>This algorithm has no procedure fields yet. A shop visit would fill them.</p>
      )}
      {(setupFields.length > 0 || measurementFields.length > 0) && (
        <>
          <p className="step-note">
            {visit
              ? `Filled from run #${visit.number}. A technician records this in the shop. This demo does not start a new bay session.`
              : "A technician fills this in the shop. The values below are an example, not a recorded run."}
          </p>
          {setupFields.length > 0 && (
            <FieldList title="Setup" rows={setupFields.map((field) => [field, setupValue(field, visit)])} />
          )}
          {measurementFields.length > 0 && (
            <FieldList
              title="Measurements"
              rows={measurementFields.map((field) => [field, measurementValue(field, visit)])}
            />
          )}
        </>
      )}
    </SectionBlock>
  );
}

function FieldList({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <>
      <p className="eyebrow">{title}</p>
      <dl>
        {rows.map(([field, value]) => (
          <Fragment key={field}>
            <dt>{field.replaceAll("_", " ")}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
    </>
  );
}

function setupValue(field: string, visit?: RunRecord): string {
  if (!visit) return SAMPLE_SETUP[field] ?? "Sample";
  if (field === "sensors") return visit.setup.sensors.join(", ") || "None";
  const value = visit.setup[field as keyof Setup];
  return typeof value === "string" && value ? value : "None";
}

function measurementValue(field: string, visit?: RunRecord): string {
  const frame = visit?.measurements[0] as Record<string, number> | undefined;
  if (frame && typeof frame[field] === "number") return String(frame[field]);
  if (visit) return "Not on this visit";
  return SAMPLE_MEASUREMENT[field] ?? "Sample";
}

function statusSentence(status: string, outcome: string): string {
  if (status === "Open") return glossary.open;
  if (status === "Testing") return glossary.testing;
  if (status === "Released") return outcome || glossary.released;
  if (status === "Closed") return outcome || glossary.closed;
  return status;
}
