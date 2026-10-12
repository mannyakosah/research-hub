import type { Setup } from "../api/types";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";

export function SetupBlock({ setup }: { setup: Setup }) {
  return (
    <SectionBlock tone="run" title="Setup" sentence={glossary.setup}>
      <dl>
        <dt>Shop</dt>
        <dd>{setup.shop}</dd>
        <dt>Vehicle</dt>
        <dd>{setup.vehicle}</dd>
        <dt>Tire</dt>
        <dd>{setup.tire}</dd>
        <dt>Sensors</dt>
        <dd>{setup.sensors.join(", ")}</dd>
      </dl>
    </SectionBlock>
  );
}
