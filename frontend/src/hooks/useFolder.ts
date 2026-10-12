import { useCallback } from "react";
import { getInvestigationFolder } from "../api/client";
import { useFetch } from "./useFetch";

export function useFolder(algorithmId: string, investigationId: string) {
  const loader = useCallback(
    () => getInvestigationFolder(algorithmId, investigationId),
    [algorithmId, investigationId],
  );
  return useFetch(loader);
}
