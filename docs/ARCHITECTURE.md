# Architecture and integration order

## Surface
- Primary: Next.js 15 / React 19 / TypeScript, mobile-responsive web dashboard. Runs on laptop at `http://localhost:3000`.
- API: Next.js server route `/api/diagnose` (Node runtime).
- Measurements: synthetic fixture, imported local probe JSON, eventually streaming collector.
- Heuristic engine: deterministic `src/lib/scoring.ts`.
- AI: server-side `src/lib/ai.ts`, Jarvislabs OpenAI-compatible Chat Completions, preferred Gemma 4 26B A4B IT. Model ID read from authenticated dashboard and provided via env.
- Orchestrator: local Temporal dev service, Worker, one Workflow, one Activity. `TEMPORAL_ENABLED=true` only after smoke test.
- Developer operations: Kepler IDE to inspect logs, processes, fix dev-stack issues, approve command execution.

## Data flow
Measurement -> zod validated contract -> Temporal workflow (if enabled) -> diagnoseActivity -> scored evidence -> Gemma narrative -> result JSON -> UI. Direct mode runs same activity logic when Temporal disabled; UI labels mode correctly.

## Integration acceptance
1. `npm run dev` renders synthetic fixture and chart; report button returns heuristic answer if no credentials.
2. Jarvis model env values set -> real model report labeled with model ID; model error visible, no fake AI.
3. `temporal server start-dev` + `npm run worker` + `TEMPORAL_ENABLED=true` -> real workflow ID returned.
4. Import `npm run probe > probe-output.json` and diagnose; source labeled HTTPS estimate with limitations.

## Security
No public hosted arbitrary-probe endpoint. Probe connects only to operator-selected trusted test endpoints; bounded load, read-only by default. Never send credentials or personal IP to LLM. Never make LLM-generated commands executable automatically.

## 3-minute demo
0:00 show loaded latency rise in synthetic trace with provenance label.
0:35 import limited real HTTPS probe JSON if the network is stable.
1:00 diagnose -> model explanation with evidence & confidence caveats.
1:45 show Temporal workflow execution including a retry/failure recovery (staged if possible).
2:25 show Kepler diagnosing a local worker issue via logs.
2:50 end with impact: network literacy + queue management hypothesis + future V2 mobile/Desktop roadmap.
