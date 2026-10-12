import { Link, useOutletContext } from "react-router-dom";
import type { HubContextValue } from "../App";
import { ContractTable } from "../components/ContractTable";
import { PredictPanel } from "../components/PredictPanel";
import { PromotionRail } from "../components/PromotionRail";
import { RecordHeader } from "../components/RecordHeader";
import { Stat } from "../components/Stat";
import { StatusBadge } from "../components/StatusBadge";
import { VersionTable } from "../components/VersionTable";
import { glossary } from "../lib/glossary";

export function AlgorithmPage() {
  const { algorithm, openNewInvestigation } = useOutletContext<HubContextValue>();
  if (algorithm.loading) return <p className="loading">Loading…</p>;
  if (algorithm.error) return <p className="error">Request failed ({algorithm.error})</p>;
  if (!algorithm.data) return null;
  const { algorithm: record, versions, pins, investigations } = algorithm.data;
  const featured =
    investigations.find((item) => item.status === "Testing") ??
    investigations.find((item) => item.status === "Open") ??
    investigations[0];

  return (
    <article className="page algorithm-page">
      <RecordHeader kind="Algorithm" title={record.name} sentence={glossary.algorithm} tone="algorithm" />
      <div className="stat-row">
        <Stat label="Current release" value={record.current_release} sentence={glossary.currentRelease} tone="version" />
        <Stat label="Repository" value={record.repository} sentence={glossary.repository} tone="algorithm" />
        <Stat
          label="Investigations"
          value={String(investigations.length)}
          sentence={glossary.investigation}
          tone="investigation"
        />
      </div>
      {featured && (
        <PromotionRail
          investigationName={featured.name}
          status={featured.status}
          hasCompleteRun={featured.has_complete_run}
          versions={versions}
          investigationId={featured.id}
          prodPin={pins.prod}
          hasCandidate={Boolean(featured.candidate_commit)}
        />
      )}
      <section className="section section-investigation">
        <header className="section-header">
          <div className="section-toolbar">
            <div className="kind-line">
              <p className="eyebrow">Investigations</p>
              <p className="definition">{glossary.investigation}</p>
            </div>
            <button type="button" onClick={() => openNewInvestigation(record.id, record.name)}>
              New investigation
            </button>
          </div>
        </header>
        <div className="section-body">
          {investigations.length === 0 && <p>No investigations yet.</p>}
          {investigations.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Candidate</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/algorithms/${record.id}/investigations/${item.id}`}>{item.name}</Link>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{item.owner}</td>
                  <td>{item.candidate_commit ? <code>{item.candidate_commit}</code> : "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </section>
      <div className="split">
        <ContractTable contract={record.contract} />
        <VersionTable versions={versions} />
      </div>
      {record.id === "wheel-balance" && <PredictPanel />}
    </article>
  );
}
