# LatencyLens sprint board — setup first

Ownership: [ROLE-MAP.md](ROLE-MAP.md). Do not start feature implementation until both engineers return their setup reports.

| Priority | Owner | Task | Acceptance |
|---|---|---|---|
| P0 first | Roojool + PR3MM, independently | Complete `docs/SETUP.md` | GitHub push access, dependencies/checks, heuristic API smoke, real Jarvislabs smoke, agent working; sanitized reports from BOTH machines |
| P0 first | Roojool | Verify Temporal CLI/server/worker and Kepler access | Actual workflow ID and completed history before enabling Temporal; real Kepler access or explicit blocker |
| P0 before deployment | Roojool + PR3MM | Review dependency advisories | `npm audit` reports 4 findings (3 high, 1 moderate); coordinate Zod/OpenAI/Next/PostCSS upgrades and contract compatibility; no blind force fix |
| P0 next | PR3MM | Scoring/fixtures and safe bounded probe | Healthy/loaded synthetic scenarios, deterministic boundary tests; no untrusted target fetching or fabricated readings |
| P0 next | PR3MM | Harden main Gemma adapter | Finite timeout, validated JSON, truthful `aiUsed`, unchanged arithmetic, safe fallback, no private data sent to model |
| P0 next | Roojool | Diagnosis API + Temporal integration | Bounded workflow/retries, actual ID on success, clear fallback on service/worker failure |
| P0 next | Roojool | shadcn dashboard + all UI integration | Existing import/diagnose flow works; provenance/missing values honest; desktop/mobile evidence |
| P0 last | Roojool + PR3MM | Merge and verify complete demonstration | Green tests/typecheck/build, sample/import → diagnosis → real model/workflow or visible fallback |
| P1 | Roojool | Kepler operations evidence and recovery | Safe, repeatable demonstration after healthy E2E; no network configuration changes |
| P1 | PR3MM | Before/after comparison fixtures | Only after P0 integrated; labeled provenance and repeatable results |

Tanvi and Manish handle presentation/video outside this engineering board.

## Order and coordination
1. Setup reports can be submitted in parallel. Missing credentials/credits/model access are blockers, not completed integrations. The heuristic starter remains available for setup smoke testing.
2. Once both machines pass, implement P0 slices concurrently against the existing frozen contract. Agree on exports before changing interfaces.
3. Run `npm run test`, `npm run typecheck`, `npm run build`; open PR and relay URL, test evidence and integration notes. Never push to main or bypass protection.
4. Roojool reviews/merges only after required `checks`; rerun E2E after each merge. Stop optional work when the demo becomes fragile.

## Initial audit — 2026-10-25
- Public repository accessible; Roojool has admin and PR3MM has write permission.
- Main requires `checks`, strict up-to-date checks and administrator enforcement. No open PRs at takeover audit.
- Roojool: Node/npm/GitHub/Codex available; `.env.local` absent and Temporal CLI absent. Jarvislabs setup unverified on both machines (confirmed by Roojool).
- PR3MM's local toolchain, agent and API access remain unverified until his setup report arrives.
