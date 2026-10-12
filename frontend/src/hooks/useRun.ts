import { useCallback } from "react";
import { getRun, getRunFiles } from "../api/client";
import { useFetch } from "./useFetch";

export function useRun(algorithmId: string, investigationId: string, number: number) {
  const loader = useCallback(
    () =>
      Promise.all([
        getRun(algorithmId, investigationId, number),
        getRunFiles(algorithmId, investigationId, number),
      ]).then(([run, files]) => ({ run, files })),
    [algorithmId, investigationId, number],
  );
  return useFetch(loader);
}
