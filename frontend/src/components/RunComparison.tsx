import { Link } from "react-router-dom";
import type { RunRecord } from "../api/types";
import { testedLabel } from "../lib/format";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";
import { Term } from "./Term";

export function RunComparison({
  algorithmId,
  investigationId,
  runs,
}: {
  algorithmId: string;
  investigationId: string;
  runs: RunRecord[];
}) {
  return (
    <SectionBlock tone="run" kind="Runs" sentence={glossary.run}>
      {runs.length === 0 && <p>No shop visits yet.</p>}
      {runs.length > 0 && (
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Shop</th>
            <th>
              <Term id="tested">Tested</Term>
            </th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.number}>
              <td>
                <Link to={`/algorithms/${algorithmId}/investigations/${investigationId}/runs/${run.number}`}>
                  #{run.number}
                </Link>
              </td>
              <td>{run.setup.shop}</td>
              <td>{testedLabel(run.tested)}</td>
              <td>{run.correction_error}°</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </SectionBlock>
  );
}
