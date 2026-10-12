import type { ReactNode } from "react";

export function SectionBlock({
  tone,
  kind,
  title,
  sentence,
  prominent,
  children,
}: {
  tone: "algorithm" | "investigation" | "run" | "version" | "plain";
  kind?: string;
  title?: string;
  sentence?: string;
  prominent?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={`section section-${tone}`}>
      <header className="section-header">
        <div className="kind-line">
          {kind ? <p className="eyebrow">{kind}</p> : <h2 className={prominent ? "figure" : undefined}>{title}</h2>}
          {sentence && <p className="definition">{sentence}</p>}
        </div>
        {kind && title && <h2 className={prominent ? "figure" : undefined}>{title}</h2>}
      </header>
      {children && <div className="section-body">{children}</div>}
    </section>
  );
}
