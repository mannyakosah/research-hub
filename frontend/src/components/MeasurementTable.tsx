import type { SensorFrame } from "../api/types";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";

export function MeasurementTable({ rows }: { rows: SensorFrame[] }) {
  return (
    <SectionBlock tone="algorithm" title="Measurements" sentence={glossary.measurements}>
      <table>
        <thead>
          <tr>
            <th>wheel_angle</th>
            <th>radial_force</th>
            <th>lateral_force</th>
            <th>wheel_speed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.wheel_angle}</td>
              <td>{row.radial_force}</td>
              <td>{row.lateral_force}</td>
              <td>{row.wheel_speed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionBlock>
  );
}
