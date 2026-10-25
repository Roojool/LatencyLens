# LatencyLens — Universal AI Agent Rules

Read `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`, then only your role file under `prompts/`.

## Active team and setup gate
- Roojool leads app/UI, Temporal/API, dependencies, integration, CI and demo.
- PR3MM owns measurements, scoring, fixtures, safe probe and Gemma adapter.
- Tanvi and Manish own presentation/video only, with no engineering assignments.
- `docs/ROLE-MAP.md` overrides historical assignments. Complete `docs/SETUP.md` on both engineers' machines before feature implementation; report blockers honestly.

## Core constraints
- 3-hour open-source AI hackathon. Ship one working E2E path first; no elaborate refactors.
- Respect designated file ownership; never overwrite another agent's changes.
- Public repository: never commit `.env`, API keys, credentials, network-identifying private data, or personal IPs.
- Not allowed: running attack traffic, high-volume scanning, arbitrary URL fetch against untrusted user target, changing network configuration without approval.
- AI never fabricates measurements or changes deterministic arithmetic. Distinguish live, estimated, synthetic.
- The current official deadline/constraints may differ from older MLH website; confirm at venue.
- `src/lib/contracts.ts` is frozen after integration starts. Propose contract changes to coordinator via issue/PR.
- Keep PR small (<~300 lines where feasible); run `npm run test`, `npm run typecheck`, `npm run build`.
- Working on a feature branch named `feat/<role>-<feature>`; commit, push, open PR. Auto-merge only after passing required CI and only for safe files.
- Always include screenshot or exact reproduction when changing UI.
- Never bypass branch protection, force-push main, or merge failing checks.

## Agent loop (repeat, do not spin forever)
1. Read current branch, role-owned files, current `docs/TASKS.md`.
2. Pick highest-priority unfinished acceptance criterion in your own role.
3. Make smallest implementation and test it.
4. Commit + push branch and create PR; return URL and handoff info.
5. If tools cannot merge automatically, hand off blocking status to coordinator; do not hide failure.
6. Proceed to next authorized role task after previous PR is merged or coordination indicates safe parallel work.
