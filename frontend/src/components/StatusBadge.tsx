import { glossary } from "../lib/glossary";

const LABELS = ["Open", "Testing", "Released", "Closed"] as const;

const SENTENCES: Record<string, string> = {
  open: glossary.open,
  testing: glossary.testing,
  released: glossary.released,
  closed: glossary.closed,
};

export function StatusBadge({ status }: { status: string }) {
  const known = LABELS.find((label) => label.toLowerCase() === status.toLowerCase()) ?? status;
  const tone = known.toLowerCase();
  const sentence = SENTENCES[tone];
  return (
    <span className={`badge badge-${tone} term`}>
      <button type="button" className="term-button">
        {known}
      </button>
      {sentence && (
        <span className="term-note" role="tooltip">
          {sentence}
        </span>
      )}
    </span>
  );
}
