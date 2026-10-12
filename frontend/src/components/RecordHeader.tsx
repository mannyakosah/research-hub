import type { ReactNode } from "react";

export function RecordHeader({
  kind,
  title,
  sentence,
  tone,
  extra,
}: {
  kind: string;
  title: string;
  sentence: string;
  tone: "algorithm" | "investigation" | "run" | "version";
  extra?: ReactNode;
}) {
  return (
    <header className={`record-header record-${tone}`}>
      <div>
        <div className="kind-line">
          <p className="eyebrow">{kind}</p>
          <p className="definition">{sentence}</p>
        </div>
        <h1>{title}</h1>
      </div>
      {extra}
    </header>
  );
}
