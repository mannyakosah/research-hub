import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";

export function useFetch<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setError(null);
    return loader()
      .then((value) => {
        setData(value);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? String(err.status) : "failed");
        setLoading(false);
      });
  }, [loader]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader()
      .then((value) => {
        if (!cancelled) {
          setData(value);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.status) : "failed");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loader]);

  return { data, error, loading, reload };
}
