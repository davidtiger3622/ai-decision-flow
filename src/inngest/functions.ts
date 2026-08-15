import { inngest } from "./client";
import { decide } from "@/lib/ai";
import {
  createRun,
  appendLog,
  completeRun,
  failRun,
  setCurrentNode,
} from "@/lib/execution-store";
import type { DecisionNodeData } from "@/types/flow";

type GraphNode = {
  id: string;
  data: DecisionNodeData;
};

type GraphEdge = {
  source: string;
  target: string;
  sourceHandle: string | null;
};

function findStartNode(nodes: GraphNode[], edges: GraphEdge[]): GraphNode | undefined {
  const targets = new Set(edges.map((e) => e.target));
  return nodes.find((n) => !targets.has(n.id));
}

function findNextNode(
  currentId: string,
  branch: "yes" | "no",
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode | undefined {
  const edge = edges.find(
    (e) => e.source === currentId && e.sourceHandle === branch
  );
  if (!edge) return undefined;
  return nodes.find((n) => n.id === edge.target);
}

export const runWorkflow = inngest.createFunction(
  { id: "run-decision-workflow", triggers: { event: "workflow/run" } },
  async ({ event, step }) => {
    const { runId, nodes, edges } = event.data as {
      runId: string;
      nodes: GraphNode[];
      edges: GraphEdge[];
    };

    await step.run("init-run", async () => {
      createRun(runId);
    });

    let current = findStartNode(nodes, edges);
    let steps = 0;
    const maxSteps = 50;

    try {
      while (current && steps < maxSteps) {
        const node = current;
        steps++;

        await step.run(`mark-active-${node.id}`, async () => {
          setCurrentNode(runId, node.id);
        });

        const decision = await step.run(`decide-${node.id}`, async () => {
          if (!node.data.prompt?.trim()) {
            return "no" as const;
          }
          const result = await decide(node.data.prompt);
          appendLog(runId, {
            nodeId: node.id,
            label: node.data.label,
            prompt: node.data.prompt,
            decision: result,
            timestamp: Date.now(),
          });
          return result;
        });

        current = findNextNode(node.id, decision, nodes, edges);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      failRun(runId, message);
      throw err;
    }

    await step.run("complete-run", async () => {
      completeRun(runId);
    });

    return { runId, steps };
  }
);
