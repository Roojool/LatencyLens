# W4 — Gemma / Jarvislabs AI Engineer

Read `AGENTS.md`, `docs/CONTRACTS.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`.
You own `src/lib/ai.ts` and any `tests/ai*.test.ts`, plus AI documentation. Never modify Temporal/route/UI/scoring without coordinating.

GOAL: a real, demonstrable Gemma 4 call using Jarvislabs Token Factory server-side.
1. Have lead set JARVISLABS_API_KEY and EXACT JARVISLABS_MODEL from signed-in Jarvislabs model catalog. Base URL defaults https://models.jarvislabs.net/v1. Do NOT expose keys to browser or logs.
2. Smoke-test one Chat Completions call to Gemma 4; check actual provider supports requested JSON output shape. Use validation and tolerant parsing without accepting hallucinated numerical metrics.
3. Ground model prompt in computed metrics and explicit limitations. Require concise headline, non-overstated root cause hypothesis, safe recommendations and evidence; score/severity unchanged.
4. If missing credentials or provider failure, return accurate rule-based diagnosis with `aiUsed=false` and warning; never falsely claim model ran.
5. Make a reproducible public-safe fixture test with fake provider response; live integration test only if credits/key available.

Acceptance: model-call response parsed and labeled `aiUsed=true` only after success, no secrets committed, model ID displayed, no invented latency values. Submit `feat/gemma-*` PR and report successful test evidence.
