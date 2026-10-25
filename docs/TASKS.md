# LatencyLens sprint board — setup first

Ownership: [ROLE-MAP.md](ROLE-MAP.md). Shared setup gate closed on 2026-10-25 after both independent reports were accepted. Core integration is verified; see [SPRINT-EVIDENCE.md](SPRINT-EVIDENCE.md) for startup commands, real workflow/model evidence and demo script.

Current verification status: [TOOL-STATUS.md](TOOL-STATUS.md). Kepler GUI inspection remains explicitly blocked; probe hardening and dependency advisories remain separate work.

| Priority | Owner | Task | Acceptance |
|---|---|---|---|
| Done | Roojool + PR3MM, independently | Complete `docs/SETUP.md` | Both reports accepted; independent checks/provider/agent smoke and push access pass; PR3MM gh authentication now resolved |
| P0 / partial | Roojool | Verify Temporal CLI/server/worker and Kepler access | Real combined Gemma workflow and completed history PASS; Kepler native Computer Use bridge BLOCKED, recorded honestly |
| P0 before deployment | Roojool + PR3MM | Review dependency advisories | `npm audit` reports 4 findings (3 high, 1 moderate); coordinate Zod/OpenAI/Next/PostCSS upgrades and contract compatibility; no blind force fix |
| P0 next | PR3MM | Scoring/fixtures and safe bounded probe | Healthy/loaded synthetic scenarios, deterministic boundary tests; no untrusted target fetching or fabricated readings |
| Done | PR3MM | Harden main Gemma adapter | PR #4 merged; finite timeout, validated stop-completion JSON, private free text excluded, real diagnostic success |
| Done | Roojool | Diagnosis API + Temporal integration | PR #6 merged; bounded no-worker/service checks, completed-only IDs, combined safe warnings and shared Activity privacy guard |
| Done | Roojool | shadcn-style dashboard + UI integration | PR #7 merged; keyboard import/diagnose, provenance/nulls, inspected desktop/mobile, no new dependencies |
| Done | Roojool + PR3MM | Merge and verify complete demonstration | 24 tests/typecheck/build pass; actual sample/import → validated Gemma → completed Temporal → UI, plus visible direct fallback |
| P1 | Roojool | Kepler operations evidence and recovery | Safe, repeatable demonstration after healthy E2E; no network configuration changes |
| P1 | PR3MM | Before/after comparison fixtures | Only after P0 integrated; labeled provenance and repeatable results |

Tanvi and Manish handle presentation/video outside this engineering board.

## Order and coordination
1. Setup reports can be submitted in parallel. Missing credentials/credits/model access are blockers, not completed integrations. The heuristic starter remains available for setup smoke testing.
2. Once both machines pass, implement P0 slices concurrently against the existing frozen contract. Agree on exports before changing interfaces.
3. Run `npm run test`, `npm run typecheck`, `npm run build`; open PR and relay URL, test evidence and integration notes. Never push to main or bypass protection.
4. Roojool reviews/merges only after required `checks`; rerun E2E after each merge. Stop optional work when the demo becomes fragile.

## Initial audit — 2026-10-25
Historical first-takeover snapshot below; see `TOOL-STATUS.md` for subsequent live checks.
- Public repository accessible; Roojool has admin and PR3MM has write permission.
- Main requires `checks`, strict up-to-date checks and administrator enforcement. No open PRs at takeover audit.
- Roojool: Node/npm/GitHub/Codex available; `.env.local` absent and Temporal CLI absent. Jarvislabs setup unverified on both machines (confirmed by Roojool).
- PR3MM's local toolchain, agent and API access remain unverified until his setup report arrives.
