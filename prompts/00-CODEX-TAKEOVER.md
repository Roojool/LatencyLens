# Roojool — lead implementation agent

Repository: https://github.com/Roojool/LatencyLens
Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`, then `prompts/01-coordinator-ui.md`.

The team has TWO engineers: Roojool (lead) and PR3MM (measurements + Gemma).
Tanvi and Manish own presentation/video only. Do not assign them code, UI or provider verification.

## Execute in order
1. Audit work, live branches/PRs, required CI and ownership; preserve existing changes. Use `feat/lead-*`, never push main.
2. Complete Roojool's setup checklist and get PR3MM's independent sanitized setup report. Verify tools, GitHub push permission, dependencies/checks, local heuristic request and real Jarvislabs access. Never print keys. Do not begin feature implementation until both pass; report account-only blockers and keep the starter usable.
3. Roojool verifies local Temporal CLI/server/worker and Kepler. Record real evidence before claiming an integration works. Keep `TEMPORAL_ENABLED=false` until a genuine completed workflow is verified.
4. After setup passes, lead owns all UI/shadcn/shared dependencies/config, Temporal/API, integration and CI. PR3MM owns scoring/sample/probe/Gemma and their tests. Keep `src/lib/contracts.ts` frozen; agree on any change first.
5. Ship existing sample/import → deterministic score → real Gemma explanation → honest workflow status first. Harden bounded workflow timeouts/retries and outage fallback. Model I/O belongs in Activities.
6. Build the dashboard in the EXISTING Next.js app using https://ui.shadcn.com/examples/dashboard as reference. Preserve import/diagnosis, source labels and missing-value `—`; include desktop/mobile screenshot or exact reproduction.
7. Use up to three configured GPT-6 Luna subagents only where useful: `temporal_worker`, `shadcn_setup`, `quality_reviewer`. Bound owned paths; isolate simultaneous writes in worktrees or serialize. Parent owns integration. Never edit PR3MM's paths concurrently.
8. Open small PRs, inspect required `checks`, review shared configuration manually, and merge only after green CI without bypass. Verify complete flow after merges; record actual model/workflow evidence or visible fallback.

Execute rather than only summarizing. Missing credentials or the other engineer's setup report are explicit gates; never pretend they are verified. No probe traffic during setup.