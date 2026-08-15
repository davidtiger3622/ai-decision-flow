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
import type { DecisionNodeData, RunState } from "@/types/flow";

type FlowNode = Node<DecisionNodeData>;

type FlowState = {
  nodes: FlowNode[];
  edges: Edge[];
  runId: string | null;
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
};

let nodeCounter = 1;
let pollHandle: ReturnType<typeof setInterval> | null = null;

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  runId: null,
  runState: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const branch = connection.sourceHandle === "yes" ? "yes" : "no";
    const color = branch === "yes" ? "#16a34a" : "#dc2626";

    const newEdge: Edge = {
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

    set({ edges: [...get().edges, newEdge] });
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
    });
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
    set({ runId });

    if (pollHandle) clearInterval(pollHandle);

    pollHandle = setInterval(async () => {
      const statusRes = await fetch(`/api/workflow/status/${runId}`);
      if (!statusRes.ok) return;
      const runState: RunState = await statusRes.json();
      set({ runState });

      const seenNodeIds = new Set<string>();
      for (const entry of runState.log) {
        seenNodeIds.add(entry.nodeId);
        setNodeStatus(entry.nodeId, entry.decision);
      }

      if (runState.status !== "running") {
        if (pollHandle) clearInterval(pollHandle);
        pollHandle = null;
      }
    }, 1500);
  },
}));
