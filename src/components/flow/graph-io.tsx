"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import type { Node, Edge } from "@xyflow/react";
import type { DecisionNodeData } from "@/types/flow";

type ExportedGraph = {
  nodes: Node<DecisionNodeData>[];
  edges: Edge[];
};

export function GraphIO() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const setGraph = useFlowStore((s) => s.setGraph);

  const handleExport = () => {
    const data: ExportedGraph = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-decision-flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as ExportedGraph;
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("Invalid graph file");
      }
      setGraph(parsed.nodes, parsed.edges);
    } catch {
      alert("Could not import file: invalid JSON graph format.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleExport}>
        Export JSON
      </Button>
      <Button variant="outline" onClick={handleImportClick}>
        Import JSON
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
