import type { ContractRecord } from "../api/types";
import { INPUTS } from "../lib/format";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";

export function ContractTable({ contract }: { contract: ContractRecord }) {
  return (
    <SectionBlock tone="algorithm" kind="Contract" title={`${contract.inputs} → ${contract.outputs}`} sentence={glossary.contract}>
      <table>
        <thead>
          <tr>
            <th>Side</th>
            <th>Field</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          {(contract.input_fields ?? INPUTS).map((name) => (
            <tr key={name}>
              <td>input</td>
              <td>{name}</td>
              <td>—</td>
            </tr>
          ))}
          {Object.entries(contract.ranges).map(([name, range]) => (
            <tr key={name}>
              <td>output</td>
              <td>{name}</td>
              <td>
                {range.min} to {range.max}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionBlock>
  );
}
