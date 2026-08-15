# AI Decision Flow

A visual AI workflow builder where each node represents an AI decision step
that evaluates a prompt and returns YES or NO. Execution is orchestrated by
Inngest; the graph is edited and visualized with React Flow.

## Stack

- Next.js (App Router, TypeScript)
- React Flow (`@xyflow/react`)
- Inngest
- OpenAI SDK, pointed at Gemini's OpenAI-compatible endpoint
- Shadcn/ui + Tailwind CSS

## Getting started

1. Install dependencies

   \`\`\`bash
   npm install
   \`\`\`

2. Copy the env template and fill in your Gemini API key

   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Run the Next.js dev server

   \`\`\`bash
   npm run dev
   \`\`\`

4. In a separate terminal, run the Inngest dev server

   \`\`\`bash
   npx inngest-cli@latest dev
   \`\`\`

5. Open http://localhost:3000 for the app and http://localhost:8288 for the
   Inngest dashboard.

## Project structure

\`\`\`
src/
  app/            Next.js routes, including /api/inngest
  components/flow React Flow canvas and node components
  components/ui   Shadcn UI components
  inngest/        Inngest client and workflow functions
  lib/            Shared utilities, AI client
  types/          Shared TypeScript types
\`\`\`

## Status

Phase 1 (setup) complete. Flow editor, Inngest workflow execution, and
AI-powered branching are in progress.
