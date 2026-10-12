import { useCallback } from "react";
import { getAlgorithm } from "../api/client";
import { useFetch } from "./useFetch";

export function useAlgorithm(algorithmId: string) {
  const loader = useCallback(() => getAlgorithm(algorithmId), [algorithmId]);
  return useFetch(loader);
}
