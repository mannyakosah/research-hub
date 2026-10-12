import { useCallback } from "react";
import { getInvestigation } from "../api/client";
import { useFetch } from "./useFetch";

export function useInvestigation(algorithmId: string, investigationId: string) {
  const loader = useCallback(
    () => getInvestigation(algorithmId, investigationId),
    [algorithmId, investigationId],
  );
  return useFetch(loader);
}
