import type { VersionRecord } from "../api/types";
import { glossary } from "../lib/glossary";

const STEPS = [
  { id: "question", label: "Question" },
  { id: "candidate", label: "Candidate" },
  { id: "runs", label: "Shop runs" },
  { id: "checks", label: "Checks" },
  { id: "version", label: "Version" },
  { id: "prod", label: "Prod" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const LINES: Record<StepId, string> = {
  question: "This investigation is the question. It has no candidate yet.",
  candidate: "Dev is running this candidate. Prod is still on the current release.",
  runs: "These visits are the evidence. A complete run records what was on the rig.",
  checks: "Release runs five checks. Prod moves only if all five pass.",
  version: "This candidate is now a version. Prod runs the artifact the shop already ran.",
  prod: "Prod is pinned to that version.",
};

export function PromotionRail({
  investigationName,
  status,
  hasCompleteRun,
  versions,
  investigationId,
  prodPin,
  hasCandidate,
}: {
  investigationName: string;
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
  const current = status === "Closed" ? null : (STEPS.find((step) => !done[step.id])?.id ?? "prod");
  const line =
    status === "Closed"
      ? glossary.closed
      : status === "Open"
        ? glossary.open
        : current === "prod" && !done.prod
          ? "Prod is still on the previous version. The new version stays in the list."
          : LINES[current ?? "prod"];

  return (
    <section className="promotion" aria-label="Promotion">
      <p className="promotion-who">Showing {investigationName}.</p>
      <ol className="promotion-steps">
        {STEPS.map((step) => {
          const state = done[step.id] ? "done" : step.id === current ? "current" : "waiting";
          return (
            <li key={step.id} className={`promotion-step is-${state}`}>
              <span className="promotion-dot" aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="promotion-line">{line}</p>
    </section>
  );
}
