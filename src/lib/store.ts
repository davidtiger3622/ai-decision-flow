import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { DecisionNodeData } from "@/types/flow";

type FlowNode = Node<DecisionNodeData>;

type FlowState = {
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: () => void;
  updateNodePrompt: (id: string, prompt: string) => void;
  updateNodeLabel: (id: string, label: string) => void;
};

let nodeCounter = 1;

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
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
}));
