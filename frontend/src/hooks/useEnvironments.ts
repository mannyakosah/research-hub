import { getEnvironments } from "../api/client";
import { useFetch } from "./useFetch";

export function useEnvironments() {
  return useFetch(getEnvironments);
}
