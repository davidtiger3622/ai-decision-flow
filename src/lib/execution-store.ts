import type { RunState } from "@/types/flow";

const runs = new Map<string, RunState & { currentNodeId?: string | null }>();

export function createRun(runId: string) {
  runs.set(runId, { status: "running", log: [], currentNodeId: null });
}

export function getRun(runId: string) {
  return runs.get(runId);
}

export function setCurrentNode(runId: string, nodeId: string | null) {
  const run = runs.get(runId);
  if (!run) return;
  run.currentNodeId = nodeId;
}

export function appendLog(runId: string, entry: RunState["log"][number]) {
  const run = runs.get(runId);
  if (!run) return;
  run.log.push(entry);
}

export function completeRun(runId: string) {
  const run = runs.get(runId);
  if (!run) return;
  run.status = "completed";
  run.currentNodeId = null;
}

export function failRun(runId: string, error: string) {
  const run = runs.get(runId);
  if (!run) return;
  run.status = "error";
  run.error = error;
  run.currentNodeId = null;
}
