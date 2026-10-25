# LatencyLens — Evidence-led AI Network Diagnostics

An open-source hackathon app: synthetic or local HTTPS timings → deterministic analysis → optional real Jarvislabs Gemma explanation → truthful Temporal execution status.

**Two engineers:** Roojool leads app/UI, Temporal/API, dependencies and integration; PR3MM owns measurements/scoring/probe/Gemma. Tanvi and Manish handle presentation/video only. [Ownership](docs/ROLE-MAP.md) and [tasks](docs/TASKS.md) are authoritative.

## Start with setup

Both engineers complete [docs/SETUP.md](docs/SETUP.md) before feature implementation. A starter already exists; do not recreate the app.

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run test
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000` and click **Run AI diagnosis**. With blank key/model and Temporal disabled, the synthetic sample returns a deterministic heuristic report. This does not verify AI or Temporal.

Set your OWN private Jarvislabs key and exact account catalog model ID in ignored `.env.local`, then run:

```powershell
npm run setup:check
npm run setup:check -- --live-ai
```

The first command checks configuration without network requests. The second makes one small real provider completion; it may consume credits. Never commit keys, share them in chat, or use `NEXT_PUBLIC_` for credentials.

## Agent handoff

- Roojool: [takeover prompt](prompts/00-CODEX-TAKEOVER.md).
- PR3MM: [complete copy-paste prompt](prompts/02-measurements.md); verify setup first, then wait for lead confirmation that both reports pass.
- Use role branches and small PRs; run tests/typecheck/build and require green `checks`. No pushes to main or protection bypass.
- Configured Luna workers are optional lead tools. Isolate concurrent writes; preserve teammates' work.

## Runtime and measurement limits

[DEPLOY.md](docs/DEPLOY.md) covers local Temporal server/worker and Gemma. Keep `TEMPORAL_ENABLED=false` until a completed real workflow is verified. Kepler is a separate development/SRE IDE.

The local probe is a bounded HTTPS timing demonstration, not ICMP or a certified bufferbloat grade. It still needs the planned endpoint/response-size hardening; do not use it for arbitrary targets. After that work, use `npm run --silent probe > probe-output.json` and import JSON. Never include private network identifiers in commits or AI prompts.

Next.js + React + TypeScript + Zod + Temporal + OpenAI-compatible Jarvislabs API. Local demo first; a hosted frontend alone cannot reach a laptop-only worker. MIT license.

[Architecture](docs/ARCHITECTURE.md) · [Contracts](docs/CONTRACTS.md) · [UI reference](docs/UI-DESIGN.md) · [Build plan](HACKDAY_PLAN.md)