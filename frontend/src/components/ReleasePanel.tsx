import { useCallback, useRef, useState } from "react";
import { useRelease } from "../hooks/useRelease";
import { useRollback } from "../hooks/useRollback";
import { glossary } from "../lib/glossary";
import { CheckList } from "./CheckList";
import { SectionBlock } from "./SectionBlock";

type Props = {
  status: string;
  candidateCommit: string;
  candidateArtifact: string;
  reloadAlgorithm: () => void;
  reloadInvestigation: () => void;
  reloadEnvironments: () => void;
};

export function ReleasePanel({
  status,
  candidateCommit,
  candidateArtifact,
  reloadAlgorithm,
  reloadInvestigation,
  reloadEnvironments,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rolledBack, setRolledBack] = useState(false);
  const refresh = useCallback(() => {
    reloadAlgorithm();
    reloadInvestigation();
    reloadEnvironments();
  }, [reloadAlgorithm, reloadInvestigation, reloadEnvironments]);
  const { release, pending, result, error } = useRelease(refresh);
  const rollback = useRollback(() => {
    setRolledBack(true);
    refresh();
  });

  return (
    <SectionBlock tone="version" kind="Release" sentence={glossary.release}>
      <div className="kind-line checks-line">
        <p className="eyebrow">Checks</p>
        <p className="definition">{glossary.checks}</p>
      </div>
      {!result?.released && status !== "Released" && (
        <>
          <p>Checks run against the candidate, and prod moves only if all five pass.</p>
          <button type="button" onClick={() => dialogRef.current?.showModal()} disabled={pending}>
            Release
          </button>
          <dialog ref={dialogRef} className="confirm-dialog">
            <p className="eyebrow">Release</p>
            <h2>Publish {candidateCommit} as the next version?</h2>
            <p>
              Checks run on <code>{candidateArtifact}</code> first. Prod moves to the new version only if all five
              pass.
            </p>
            <div className="confirm-actions">
              <button type="button" className="secondary" onClick={() => dialogRef.current?.close()}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dialogRef.current?.close();
                  void release();
                }}
                disabled={pending}
              >
                Release
              </button>
            </div>
          </dialog>
        </>
      )}
      {error && <p className="error">Request failed ({error})</p>}
      {result && <CheckList checks={result.checks} />}
      {(result?.released || status === "Released") && !rolledBack && (
        <>
          <p>Prod is pinned to wheel-balance:2. V1 is still in the registry.</p>
          <button type="button" onClick={() => void rollback.rollback()} disabled={rollback.pending}>
            Roll back to V1
          </button>
        </>
      )}
      {rolledBack && <p>Prod is pinned to wheel-balance:1. V2 stays in the version list.</p>}
      {rollback.error && <p className="error">Request failed ({rollback.error})</p>}
    </SectionBlock>
  );
}
