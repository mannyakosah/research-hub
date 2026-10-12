import { useState, type ReactNode } from "react";
import { termCopy, type TermId } from "../lib/glossary";

const TIP_WIDTH = 260;

export function Term({ id, children }: { id: TermId; children?: ReactNode }) {
  return <Tip text={termCopy[id]}>{children ?? id}</Tip>;
}

export function Tip({ text, children }: { text: string; children: ReactNode }) {
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  function show(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const margin = 12;
    let left = rect.left;
    if (left + TIP_WIDTH > window.innerWidth - margin) {
      left = window.innerWidth - margin - TIP_WIDTH;
    }
    left = Math.max(margin, left);
    const height = 96;
    let top = rect.bottom + 8;
    if (top + height > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - 8 - height);
    }
    setPlace({ top, left });
  }

  return (
    <span className="term">
      <button
        type="button"
        className="term-button"
        aria-describedby={place ? "term-tip" : undefined}
        onMouseEnter={(event) => show(event.currentTarget)}
        onMouseLeave={() => setPlace(null)}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setPlace(null)}
      >
        {children}
      </button>
      {place && (
        <span
          id="term-tip"
          className="term-note"
          role="tooltip"
          style={{ top: place.top, left: place.left, width: TIP_WIDTH }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
