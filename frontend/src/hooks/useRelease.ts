import { useCallback, useState } from "react";
import { ApiError, release as postRelease } from "../api/client";
import type { ReleasePayload } from "../api/types";

export function useRelease(onReleased: () => void) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ReleasePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const release = useCallback(() => {
    setPending(true);
    setError(null);
    return postRelease()
      .then((payload) => {
        setResult(payload);
        if (payload.released) onReleased();
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? String(err.status) : "failed");
      })
      .finally(() => setPending(false));
  }, [onReleased]);

  return { release, pending, result, error };
}
