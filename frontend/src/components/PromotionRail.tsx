import type { VersionRecord } from "../api/types";
import { glossary } from "../lib/glossary";

export const PROMOTION_STEPS = [
  { id: "question", label: "Question" },
  { id: "candidate", label: "Candidate" },
  { id: "runs", label: "Shop runs" },
  { id: "checks", label: "Checks" },
  { id: "version", label: "Version" },
  { id: "prod", label: "Prod" },
] as const;

export type StepId = (typeof PROMOTION_STEPS)[number]["id"];

const LINES: Record<StepId, string> = {
  question: "This investigation is the question.",
  candidate: "No candidate is pinned yet. Dev would run it, and prod stays on the current release.",
  runs: "A shop visit fills the procedure. A complete run is the evidence.",
  checks: "Release runs five checks. Prod moves only if all five pass.",
  version: "Release publishes this candidate as the next version.",
  prod: "Prod runs a released version only.",
};

const DONE_LINES: Record<StepId, string> = {
  question: "This investigation is the question.",
  candidate: "Dev is running this candidate. Prod is still on the current release.",
  runs: "These visits are the evidence. A complete run records what was on the rig.",
  checks: "The five checks passed, and the candidate was published.",
  version: "This candidate is now a version. Prod runs the artifact the shop already ran.",
  prod: "Prod is pinned to that version.",
};

export function isStepId(value: string | null): value is StepId {
  return PROMOTION_STEPS.some((step) => step.id === value);
}

export function promotionState({
  status,
  hasCompleteRun,
  versions,
  investigationId,
  prodPin,
  hasCandidate,
}: {
  status: string;
  hasCompleteRun: boolean;
  versions: VersionRecord[];
  investigationId: string;
  prodPin: string;
  hasCandidate?: boolean;
}) {
  const released = versions.find((version) => version.from_investigation === investigationId) ?? null;
  const done: Record<StepId, boolean> = {
    question: true,
    candidate: status === "Testing" || status === "Released" || (status === "Closed" && Boolean(hasCandidate)),
    runs: hasCompleteRun,
    checks: status === "Released",
    version: released !== null,
    prod: released !== null && prodPin === released.artifact_id,
  };
  const current = status === "Closed" ? null : (PROMOTION_STEPS.find((step) => !done[step.id])?.id ?? "prod");
  return { done, current, released };
}

export function PromotionRail({
  investigationName,
  status,
  hasCompleteRun,
  versions,
  investigationId,
  prodPin,
  hasCandidate,
  selected,
  onSelect,
}: {
  investigationName: string;
  status: string;
  hasCompleteRun: boolean;
  versions: VersionRecord[];
  investigationId: string;
  prodPin: string;
  hasCandidate?: boolean;
  selected: StepId;
  onSelect: (step: StepId) => void;
}) {
  const { done, current } = promotionState({
    status,
    hasCompleteRun,
    versions,
    investigationId,
    prodPin,
    hasCandidate,
  });
  const line = status === "Closed" && selected === "question" ? glossary.closed : done[selected] ? DONE_LINES[selected] : LINES[selected];

  return (
    <section className="promotion" aria-label="Promotion">
      <p className="promotion-who">Showing {investigationName}.</p>
      <ol className="promotion-steps">
        {PROMOTION_STEPS.map((step) => {
          const state = done[step.id] ? "done" : step.id === current ? "current" : "waiting";
          return (
            <li key={step.id} className={`promotion-step is-${state}${step.id === selected ? " is-selected" : ""}`}>
              <button
                type="button"
                aria-current={step.id === current ? "step" : undefined}
                aria-pressed={step.id === selected}
                aria-controls="promotion-detail"
                onClick={() => onSelect(step.id)}
              >
                <span className="promotion-dot" aria-hidden="true" />
                <span>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="promotion-line">{line}</p>
    </section>
  );
}
