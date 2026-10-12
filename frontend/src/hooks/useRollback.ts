import { useCallback, useState } from "react";
import { ApiError, rollback as postRollback } from "../api/client";

export function useRollback(onRolledBack: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rollback = useCallback(() => {
    setPending(true);
    setError(null);
    return postRollback()
      .then(() => onRolledBack())
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? String(err.status) : "failed");
      })
      .finally(() => setPending(false));
  }, [onRolledBack]);

  return { rollback, pending, error };
}
