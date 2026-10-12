export type SensorFrame = {
  radial_force: number;
  lateral_force: number;
  wheel_angle: number;
  wheel_speed: number;
};

export type BalanceCorrection = {
  correction_angle: number;
  correction_weight: number;
  lateral_adjustment: number;
  confidence: number;
};

export type FieldRange = {
  min: number;
  max: number;
};

export type ContractRecord = {
  inputs: string;
  outputs: string;
  ranges: Record<string, FieldRange>;
  input_fields?: string[];
};

export type AlgorithmRecord = {
  id: string;
  name: string;
  repository: string;
  contract: ContractRecord;
  current_release: string;
  procedure_revision: number;
};

export type VersionRecord = {
  number: string;
  algorithm_id: string;
  commit: string;
  artifact_id: string;
  from_investigation: string | null;
  evidence_run: number | null;
  released_by: string;
  released_at: string;
};

export type InvestigationRecord = {
  id: string;
  name: string;
  algorithm_id: string;
  owner: string;
  candidate_commit: string;
  candidate_artifact: string;
  status: string;
  outcome: string;
  folder: string;
};

export type ProcedureRecord = {
  algorithm_id: string;
  revision: number;
  blocks: Record<string, string[]>;
};

export type Tested = {
  kind: "version" | "candidate";
  number?: string | null;
  commit?: string | null;
};

export type Setup = {
  shop: string;
  vehicle: string;
  tire: string;
  sensors: string[];
};

export type RunRecord = {
  number: number;
  investigation_id: string;
  procedure_revision: number;
  tested: Tested;
  technician: string;
  date: string;
  status: string;
  setup: Setup;
  measurements: SensorFrame[];
  correction_error: number;
  output: BalanceCorrection;
  folder: string;
};

export type Pins = {
  dev: string;
  prod: string;
};

export type CheckResult = {
  name: string;
  passed: boolean;
  detail: string;
};

export type InvestigationSummary = {
  id: string;
  name: string;
  status: string;
  owner: string;
  candidate_commit: string;
  has_complete_run: boolean;
};

export type AlgorithmSummary = {
  id: string;
  name: string;
  investigations: InvestigationSummary[];
};

export type AlgorithmPayload = {
  algorithm: AlgorithmRecord;
  versions: VersionRecord[];
  procedure: ProcedureRecord;
  pins: Pins;
  investigations: InvestigationSummary[];
};

export type InvestigationPayload = {
  investigation: InvestigationRecord;
  runs: RunRecord[];
};

export type RunPayload = RunRecord;

export type RunFile = {
  name: string;
  kind: string;
  path: string;
  size: number;
};

export type FolderFile = RunFile & {
  origin: string;
};

export type RunFolder = {
  number: number;
  files: RunFile[];
};

export type InvestigationFolder = {
  folder: string;
  files: FolderFile[];
  runs: RunFolder[];
};

export type ReleasePayload = {
  checks: CheckResult[];
  released: boolean;
  version: VersionRecord | null;
  pins: Pins;
};

export type RollbackPayload = {
  pins: Pins;
  current_release: string;
};

export type PinsPayload = Pins;

export type PredictPayload = {
  environment: "dev" | "prod";
  artifact_id: string;
  version: string | null;
  output: BalanceCorrection;
};
