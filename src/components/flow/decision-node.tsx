"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFlowStore } from "@/lib/store";
import type { DecisionNodeData } from "@/types/flow";

const statusColors: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  yes: "bg-green-100 text-green-700",
  no: "bg-red-100 text-red-700",
  error: "bg-red-200 text-red-800",
};

export function DecisionNode({ id, data }: NodeProps) {
  const nodeData = data as DecisionNodeData;
  const updateNodePrompt = useFlowStore((s) => s.updateNodePrompt);
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel);

  return (
    <Card className="w-64 p-3 gap-2">
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between gap-2">
        <Input
          value={nodeData.label}
          onChange={(e) => updateNodeLabel(id, e.target.value)}
          className="h-7 text-sm font-medium"
        />
        <Badge className={statusColors[nodeData.status ?? "idle"]}>
          {nodeData.status ?? "idle"}
        </Badge>
      </div>

      <Textarea
        value={nodeData.prompt}
        onChange={(e) => updateNodePrompt(id, e.target.value)}
        placeholder="Enter the decision question..."
        className="text-xs min-h-16 nodrag"
      />

      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>NO</span>
        <span>YES</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "70%", background: "#16a34a" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "30%", background: "#dc2626" }}
      />
    </Card>
  );
}
