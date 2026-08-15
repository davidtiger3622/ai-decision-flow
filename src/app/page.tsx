import { FlowCanvas } from "@/components/flow/flow-canvas";
import { ExecutionLogPanel } from "@/components/flow/execution-log-panel";

export default function Home() {
  return (
    <main className="w-screen h-screen flex">
      <div className="flex-1 h-full">
        <FlowCanvas />
      </div>
      <ExecutionLogPanel />
    </main>
  );
}
