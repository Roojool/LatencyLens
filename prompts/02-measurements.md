# PR3MM — second engineer: measurements + Gemma

You are PR3MM's implementation agent for https://github.com/Roojool/LatencyLens.
Roojool is project lead and owns app/UI, Temporal/API, dependencies and integration. Tanvi and Manish handle presentation/video only.

Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`, `docs/ARCHITECTURE.md`, and `docs/SETUP.md` first. Inspect Git status/branches and open PRs; preserve existing work.

## First: verify my setup before building
1. Clone/update safely; verify GitHub login and my write access. Use `feat/measurements-ai-*`; never commit to main.
2. Complete the PR3MM checklist in `docs/SETUP.md`: Node/npm/Git/gh and a working coding agent; `npm ci`; tests/typecheck/build; ignored `.env.local`; local heuristic API smoke.
3. Privately configure MY OWN Jarvislabs key, credits, verified provider base URL and exact available model ID. Run `npm run setup:check`, then `npm run setup:check -- --live-ai`. Do not invent a model ID, print secrets, use someone else's key, or commit env files. No Temporal/Kepler installation is required on my machine.
4. Return a sanitized setup report to Roojool. If account/login/credits require me, give precise private setup steps and stop dependent work. Do not mark missing access as verified. Wait for Roojool to confirm BOTH setup reports pass before feature implementation.

## Then: implement the smallest complete P0 slice
Own ONLY `src/lib/scoring.ts`, `src/lib/sample.ts`, `src/lib/ai.ts`, `scripts/probe.mjs`, `tests/scoring.test.ts`, and new tests for those modules. You are not alone in this codebase; preserve others' changes. Shared dependencies/contracts need lead agreement.

1. First fix the observed diagnostic JSON parse failure documented in `docs/TOOL-STATUS.md`: provider access works but `analyzeWithGemma(sampleMeasurement)` fails with `SyntaxError`. Investigate truncation/code fences and output validation; never treat a provider connectivity check as validated diagnostic JSON. Harden server-side Gemma adapter: bounded timeout, safe deterministic fallback, no secrets/private targets in prompts/errors, and `aiUsed=true` only after successful real completion/validation. LLM must never change score/severity/delta/ratio.
2. Audit arithmetic/boundaries and provenance; add focused tests and healthy/high-inflation SYNTHETIC fixtures while preserving exports.
3. Harden local HTTPS probe: fixed/allowlisted trusted endpoints, bounded requests/bytes/timeouts, no arbitrary URL fetching/high-volume scans. No load traffic during setup. Label HTTPS estimates honestly; never claim ICMP or certified bufferbloat grades.
4. Test malformed output, provider failure and unchanged arithmetic using mocks; live smoke is opt-in only. Preserve frozen contract and caller expectations.
5. Run `npm run test`, `npm run typecheck`, `npm run build`. Commit/push, open a small PR, return URL/evidence/exports/integration notes. Never merge failing CI or bypass protection. Coordinate next slice after merge or explicit safe parallel approval.

Start by executing setup checks, not by returning only a plan. Never send keys in chat or issues.
