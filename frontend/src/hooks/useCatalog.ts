import { getAlgorithms } from "../api/client";
import { useFetch } from "./useFetch";

export function useCatalog() {
  return useFetch(getAlgorithms);
}
