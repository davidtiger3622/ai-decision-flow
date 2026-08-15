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
import { useFlowStore } from "@/lib/store";
import { DecisionNode } from "./decision-node";

export function FlowCanvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);

  const nodeTypes = useMemo<NodeTypes>(
    () => ({ decisionNode: DecisionNode }),
    []
  );

  const handleAddNode = useCallback(() => {
    addNode();
  }, [addNode]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={handleAddNode}>Add Decision Node</Button>
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
