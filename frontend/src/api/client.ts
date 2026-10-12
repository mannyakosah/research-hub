import type {
  AlgorithmPayload,
  AlgorithmSummary,
  InvestigationFolder,
  InvestigationPayload,
  PinsPayload,
  PredictPayload,
  ReleasePayload,
  RollbackPayload,
  RunFile,
  RunPayload,
  SensorFrame,
} from "./types";

const BASE = "/api";

function investigationPath(algorithmId: string, investigationId: string): string {
  return `/algorithms/${algorithmId}/investigations/${investigationId}`;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(String(status));
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status);
  }
  if (!response.ok || body === null || typeof body !== "object") {
    throw new ApiError(response.status);
  }
  return body as T;
}

export function createAlgorithm(name: string, repository: string): Promise<{ id: string }> {
  return request("/algorithms", { method: "POST", body: JSON.stringify({ name, repository }) });
}

export function createInvestigation(algorithmId: string, name: string, owner: string): Promise<{ id: string }> {
  return request(`/algorithms/${algorithmId}/investigations`, {
    method: "POST",
    body: JSON.stringify({ name, owner }),
  });
}

export function getAlgorithms(): Promise<AlgorithmSummary[]> {
  return request("/algorithms");
}

export function getAlgorithm(algorithmId: string): Promise<AlgorithmPayload> {
  return request(`/algorithms/${algorithmId}`);
}

export function getInvestigation(algorithmId: string, investigationId: string): Promise<InvestigationPayload> {
  return request(investigationPath(algorithmId, investigationId));
}

export function getInvestigationFolder(algorithmId: string, investigationId: string): Promise<InvestigationFolder> {
  return request(`${investigationPath(algorithmId, investigationId)}/files`);
}

export function folderFileUrl(algorithmId: string, investigationId: string, name: string): string {
  return `${BASE}${investigationPath(algorithmId, investigationId)}/files/${name}`;
}

export function getRun(algorithmId: string, investigationId: string, number: number): Promise<RunPayload> {
  return request(`${investigationPath(algorithmId, investigationId)}/runs/${number}`);
}

export function getRunFiles(algorithmId: string, investigationId: string, number: number): Promise<RunFile[]> {
  return request(`${investigationPath(algorithmId, investigationId)}/runs/${number}/files`);
}

export function fileUrl(algorithmId: string, investigationId: string, number: number, path: string): string {
  return `${BASE}${investigationPath(algorithmId, investigationId)}/runs/${number}/files/${path}`;
}

export function release(): Promise<ReleasePayload> {
  return request("/algorithms/wheel-balance/release", { method: "POST" });
}

export function rollback(): Promise<RollbackPayload> {
  return request("/algorithms/wheel-balance/rollback", { method: "POST" });
}

export function predict(environment: "dev" | "prod", inputs: SensorFrame): Promise<PredictPayload> {
  return request("/algorithms/wheel-balance/predict", {
    method: "POST",
    body: JSON.stringify({ environment, inputs }),
  });
}

export function getEnvironments(): Promise<PinsPayload> {
  return request("/environments");
}
