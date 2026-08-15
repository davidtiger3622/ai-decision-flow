"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFlowStore } from "@/lib/store";

const decisionColors: Record<string, string> = {
  yes: "bg-green-100 text-green-700",
  no: "bg-red-100 text-red-700",
  error: "bg-red-200 text-red-800",
};

export function ExecutionLogPanel() {
  const runState = useFlowStore((s) => s.runState);

  if (!runState) {
    return (
      <div className="w-72 border-l bg-background p-4 text-sm text-muted-foreground">
        Run the workflow to see execution logs.
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">Execution Log</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Status: {runState.status}
        </p>
        {runState.error && (
          <p className="text-xs text-red-600 mt-1">{runState.error}</p>
        )}
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-3">
          {runState.log.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Waiting for first step...
            </p>
          )}
          {runState.log.map((entry, i) => (
            <div key={`${entry.nodeId}-${entry.timestamp}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">
                  {i + 1}. {entry.label}
                </span>
                <Badge className={decisionColors[entry.decision]}>
                  {entry.decision.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {entry.prompt}
              </p>
              <Separator className="mt-3" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
