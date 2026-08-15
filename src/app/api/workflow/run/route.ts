import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nodes, edges } = body;

  const runId = randomUUID();

  await inngest.send({
    name: "workflow/run",
    data: { runId, nodes, edges },
  });

  return NextResponse.json({ runId });
}
