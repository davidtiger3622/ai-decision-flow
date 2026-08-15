export type DecisionNodeData = {
  label: string;
  prompt: string;
  status?: "idle" | "running" | "yes" | "no" | "error";
};

export type DecisionEdgeData = {
  branch: "yes" | "no";
};

export type ExecutionLogEntry = {
  nodeId: string;
  label: string;
  prompt: string;
  decision: "yes" | "no" | "error";
  timestamp: number;
};

export type RunStatus = "running" | "completed" | "error";

export type RunState = {
  status: RunStatus;
  log: ExecutionLogEntry[];
  error?: string;
};
