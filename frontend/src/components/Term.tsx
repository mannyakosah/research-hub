import type { ReactNode } from "react";
import { termCopy, type TermId } from "../lib/glossary";

export function Term({ id, children }: { id: TermId; children?: ReactNode }) {
  return (
    <span className="term">
      <button type="button" className="term-button">
        {children ?? id}
      </button>
      <span className="term-note" role="tooltip">
        {termCopy[id]}
      </span>
    </span>
  );
}
