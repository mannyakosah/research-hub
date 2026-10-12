import { useState } from "react";
import { usePredict } from "../hooks/usePredict";
import { SAMPLE } from "../lib/format";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";
import { Term } from "./Term";

export function PredictPanel() {
  const [environment, setEnvironment] = useState<"dev" | "prod">("prod");
  const { submit, pending, result, error } = usePredict();

  return (
    <SectionBlock tone="plain" kind="Predict" title="Sample frame" sentence={glossary.predict}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(environment, SAMPLE);
        }}
      >
        <label>
          Environment
          <select value={environment} onChange={(event) => setEnvironment(event.target.value as "dev" | "prod")}>
            <option value="prod">Prod</option>
            <option value="dev">Dev</option>
          </select>
        </label>
        <div className="sample-inputs">
          <span>radial_force {SAMPLE.radial_force}</span>
          <span>lateral_force {SAMPLE.lateral_force}</span>
          <span>wheel_angle {SAMPLE.wheel_angle}</span>
          <span>wheel_speed {SAMPLE.wheel_speed}</span>
        </div>
        <button type="submit" disabled={pending}>
          Run
        </button>
      </form>
      {error && <p className="error">Request failed ({error})</p>}
      {result && (
        <div className="predict-result">
          <p>
            <Term id="artifact">Artifact</Term> <code>{result.artifact_id}</code>
          </p>
          <p>
            <Term id="version">Version</Term> {result.version ?? "candidate"}
          </p>
          <dl>
            <dt>correction_angle</dt>
            <dd>{result.output.correction_angle}</dd>
            <dt>correction_weight</dt>
            <dd>{result.output.correction_weight}</dd>
            <dt>lateral_adjustment</dt>
            <dd>{result.output.lateral_adjustment}</dd>
            <dt>confidence</dt>
            <dd>{result.output.confidence}</dd>
          </dl>
        </div>
      )}
    </SectionBlock>
  );
}
