import type { RunState } from "@/types/flow";

const runs = new Map<string, RunState>();

export function createRun(runId: string) {
  runs.set(runId, { status: "running", log: [] });
}

export function getRun(runId: string): RunState | undefined {
  return runs.get(runId);
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
}

export function failRun(runId: string, error: string) {
  const run = runs.get(runId);
  if (!run) return;
  run.status = "error";
  run.error = error;
}
