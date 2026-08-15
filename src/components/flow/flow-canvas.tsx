"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFlowStore } from "@/lib/store";
import { DecisionNode } from "./decision-node";

const statusColors: Record<string, string> = {
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

export function FlowCanvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);
  const runWorkflow = useFlowStore((s) => s.runWorkflow);
  const runState = useFlowStore((s) => s.runState);

  const nodeTypes = useMemo<NodeTypes>(
    () => ({ decisionNode: DecisionNode }),
    []
  );

  const handleAddNode = useCallback(() => {
    addNode();
  }, [addNode]);

  const handleRun = useCallback(() => {
    runWorkflow();
  }, [runWorkflow]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Button onClick={handleAddNode} variant="outline">
          Add Decision Node
        </Button>
        <Button
          onClick={handleRun}
          disabled={runState?.status === "running" || nodes.length === 0}
        >
          Run Workflow
        </Button>
        {runState && (
          <Badge className={statusColors[runState.status]}>
            {runState.status}
          </Badge>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
