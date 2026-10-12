import type { BalanceCorrection } from "../api/types";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";

export function ResultBlock({ error, output }: { error: number; output: BalanceCorrection }) {
  return (
    <SectionBlock tone="run" kind="Result" title={`${error}°`} sentence={glossary.result}>
      <dl>
        <dt>correction_angle</dt>
        <dd>{output.correction_angle}</dd>
        <dt>correction_weight</dt>
        <dd>{output.correction_weight}</dd>
        <dt>lateral_adjustment</dt>
        <dd>{output.lateral_adjustment}</dd>
        <dt>confidence</dt>
        <dd>{output.confidence}</dd>
      </dl>
    </SectionBlock>
  );
}
