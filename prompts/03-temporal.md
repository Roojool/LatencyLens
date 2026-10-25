# W3 — Temporal Reliability Engineer

Read `AGENTS.md`, `docs/CONTRACTS.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`.
You own `src/temporal/{activities,workflows,worker}.ts` and `src/app/api/diagnose/route.ts` only; coordinate with W4 before changing the AI function signature. Do not modify UI or scoring.

GOAL: show a genuinely executed Temporal workflow in local dev with Workflow ID. No fake workflow badges.
1. Install/start Temporal dev server using official docs (service port 7233); start Worker with `npm run worker`.
2. Verify Next `/api/diagnose` when `TEMPORAL_ENABLED=true` starts `diagnosisWorkflow` on `latencylens-diagnostics` queue and waits for result.
3. Verify activities make network/LLM calls, NEVER inside Workflow code (determinism).
4. Retry max 2, reasonable timeout; check actual failure recovery. Avoid endlessly waiting when Worker is missing; add finite request timeout or clear error.
5. Demonstrate real workflow details in Temporal Web UI. Ensure direct-mode fallback is plainly labeled when Temporal unavailable.
6. Add a thin test/smoke script if time. Avoid a second service/framework unless absolutely necessary.

Acceptance: actual workflow ID, correct result, Temporal UI evidence, safe fallback. Submit branch `feat/temporal-*`, PR, handoff command list.
