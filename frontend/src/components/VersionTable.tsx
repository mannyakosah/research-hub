import { Link } from "react-router-dom";
import type { VersionRecord } from "../api/types";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";
import { Term } from "./Term";

export function VersionTable({ versions }: { versions: VersionRecord[] }) {
  return (
    <SectionBlock tone="version" kind="Versions" sentence={glossary.version}>
      {versions.length === 0 && <p>No versions yet.</p>}
      {versions.length > 0 && (
      <table>
        <thead>
          <tr>
            <th>
              <Term id="version">Number</Term>
            </th>
            <th>Commit</th>
            <th>
              <Term id="artifact">Artifact</Term>
            </th>
            <th>Evidence run</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version) => (
            <tr key={version.artifact_id}>
              <td>{version.number}</td>
              <td>
                <code>{version.commit}</code>
              </td>
              <td>
                <code>{version.artifact_id}</code>
              </td>
              <td>
                {version.evidence_run === null || !version.from_investigation ? (
                  "—"
                ) : (
                  <Link
                    to={`/algorithms/${version.algorithm_id}/investigations/${version.from_investigation}/runs/${version.evidence_run}`}
                  >
                    #{version.evidence_run}
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </SectionBlock>
  );
}
