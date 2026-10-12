import { useState } from "react";
import { ApiError, predict } from "../api/client";
import type { PredictPayload, SensorFrame } from "../api/types";

export function usePredict() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<PredictPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(environment: "dev" | "prod", inputs: SensorFrame) {
    setPending(true);
    setError(null);
    return predict(environment, inputs)
      .then((payload) => setResult(payload))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? String(err.status) : "failed");
      })
      .finally(() => setPending(false));
  }

  return { submit, pending, result, error };
}
