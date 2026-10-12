export function Stat({
  label,
  value,
  sentence,
  tone,
}: {
  label: string;
  value: string;
  sentence?: string;
  tone: "algorithm" | "investigation" | "run" | "version";
}) {
  return (
    <section className={`stat stat-${tone}`}>
      <div className="kind-line">
        <p className="eyebrow">{label}</p>
        {sentence && <p className="definition">{sentence}</p>}
      </div>
      <p className="stat-value">{value}</p>
    </section>
  );
}
