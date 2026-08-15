export type DecisionNodeData = {
  label: string;
  prompt: string;
  status?: "idle" | "running" | "yes" | "no" | "error";
};

export type DecisionEdgeData = {
  branch: "yes" | "no";
};
