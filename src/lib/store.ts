import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { DecisionNodeData, DecisionEdgeData, RunState } from "@/types/flow";

type FlowNode = Node<DecisionNodeData>;

type FlowState = {
  nodes: FlowNode[];
  edges: Edge[];
  runState: RunState | null;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: () => void;
  updateNodePrompt: (id: string, prompt: string) => void;
  updateNodeLabel: (id: string, label: string) => void;
  setNodeStatus: (id: string, status: DecisionNodeData["status"]) => void;
  resetNodeStatuses: () => void;
  runWorkflow: () => Promise<void>;
  setGraph: (nodes: FlowNode[], edges: Edge[]) => void;
};

let nodeCounter = 1;
let pollHandle: ReturnType<typeof setInterval> | null = null;

function buildEdge(connection: Connection): Edge<DecisionEdgeData> {
  const branch = connection.sourceHandle === "yes" ? "yes" : "no";
  const color = branch === "yes" ? "#16a34a" : "#dc2626";

  return {
    id: `edge-${connection.source}-${connection.target}-${branch}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    label: branch.toUpperCase(),
    style: { stroke: color, strokeWidth: 2 },
    labelStyle: { fill: color, fontWeight: 600, fontSize: 10 },
    data: { branch },
  };
}

function markActiveEdges(edges: Edge[], activeNodeId: string | null): Edge[] {
  return edges.map((edge) => {
    const isActive = activeNodeId !== null && edge.target === activeNodeId;
    return {
      ...edge,
      animated: isActive,
      style: {
        ...edge.style,
        strokeWidth: isActive ? 3.5 : 2,
      },
    };
  });
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  runState: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: [...get().edges, buildEdge(connection)] });
  },

  addNode: () => {
    const id = `node-${nodeCounter++}`;
    const newNode: FlowNode = {
      id,
      type: "decisionNode",
      position: { x: 100, y: 100 * get().nodes.length },
      data: {
        label: `Decision ${id}`,
        prompt: "",
        status: "idle",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodePrompt: (id, prompt) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, prompt } } : node
      ),
    });
  },

  updateNodeLabel: (id, label) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label } } : node
      ),
    });
  },

  setNodeStatus: (id, status) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, status } } : node
      ),
    });
  },

  resetNodeStatuses: () => {
    set({
      nodes: get().nodes.map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" },
      })),
      edges: markActiveEdges(get().edges, null),
    });
  },

  setGraph: (nodes, edges) => {
    set({ nodes, edges });
  },

  runWorkflow: async () => {
    const { nodes, edges, resetNodeStatuses, setNodeStatus } = get();
    resetNodeStatuses();
    set({ runState: { status: "running", log: [] } });

    const graphNodes = nodes.map((n) => ({ id: n.id, data: n.data }));
    const graphEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
    }));

    const res = await fetch("/api/workflow/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: graphNodes, edges: graphEdges }),
    });
    const { runId } = await res.json();

    if (pollHandle) clearInterval(pollHandle);

    pollHandle = setInterval(async () => {
      const statusRes = await fetch(`/api/workflow/status/${runId}`);
      if (!statusRes.ok) return;
      const runState: RunState = await statusRes.json();
      set({ runState });

      for (const entry of runState.log) {
        setNodeStatus(entry.nodeId, entry.decision);
      }

      if (runState.currentNodeId) {
        setNodeStatus(runState.currentNodeId, "running");
      }

      set({ edges: markActiveEdges(edges, runState.currentNodeId ?? null) });

      if (runState.status !== "running") {
        if (pollHandle) clearInterval(pollHandle);
        pollHandle = null;
        set({ edges: markActiveEdges(get().edges, null) });
      }
    }, 400);
  },
}));
