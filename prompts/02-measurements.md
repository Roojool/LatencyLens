# W2 — PR3MM: Network Engine and Main AI Implementation (35% engineering)

Read `AGENTS.md`, `docs/CONTRACTS.md`, `docs/TASKS.md`, `docs/ROLE-MAP.md`.
Own `src/lib/scoring.ts`, `src/lib/sample.ts`, `src/lib/ai.ts`, `scripts/probe.mjs`, `tests/scoring.test.ts`, new tests for these files.

## P0
1. Confirm scoring arithmetic / invalid boundaries and source provenance; validate all data against existing `src/lib/contracts.ts` (contract frozen).
2. Harden bounded HTTPS probe, including fixed/allowlisted targets, timeouts and honest labeling. Do not claim ICMP measurements or formal loaded-latency test.
3. Provide two clearly labeled synthetic fixtures (healthy vs high inflation), with deterministic expected scores.
4. Take ownership of robust `src/lib/ai.ts` Jarvislabs Gemma adapter. Keep real call server-only, finite timeout, JSON parse/validation, fallback on error, `aiUsed` only on verified success; never mutate score/severity.
5. Coordinate model ID / account-only verification with Manish. Do not request or commit his key.

## P1 after integration
- Before/after comparison data and credible explanations, repeatability tests. No package/dependency edits without lead approval.

Only edit your owned paths. Open `feat/measurements-ai-*` PR, run `npm run test`, `npm run typecheck`, `npm run build`. Send lead PR URL and exactly what W1 must integrate.
