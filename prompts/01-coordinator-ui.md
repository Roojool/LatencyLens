# W1 — Roojool / Codex orchestrator: Temporal + Kepler + shadcn integration

Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/CONTRACTS.md`, `docs/TASKS.md`, `docs/UI-DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOY.md` first. Full takeover prompt is `prompts/00-CODEX-TAKEOVER.md`.

**You own the majority of engineering with PR3MM.** Tanvi only writes presentation components; Manish only smoke-tests Jarvislabs. You own `src/temporal/**`, `src/app/api/diagnose/route.ts`, `src/app/page.tsx`, global styles, package/config changes for shadcn, frontend integration, Kepler runbook, CI/status and final demo.

## Priority order
1. Inspect actual Git status, open PRs, package versions, CI. Do not overwrite ongoing teammate branches.
2. Keep current app working: `npm ci`, `npm run test`, `npm run typecheck`, `npm run build`.
3. Initialize shadcn in the **existing** Next.js app and add minimal primitives (card/button/badge/separator/sidebar/skeleton if appropriate). Own shared `package.json`, lockfile, `src/components/ui/**`, Tailwind/global CSS changes. Make sure Tanvi can import components; tell her actual paths.
4. Make Temporal diagnosis WORK: local server, Worker, one activity calling the existing scoring/AI service, truthful workflow ID, reasonable timeout/retry, clear fallback. Kepler investigates actual operational errors and assists with approved recovery. Never pretend an embedded Kepler API exists.
5. Accept Tanvi's `src/components/dashboard/**` PR and integrate into `src/app/page.tsx`. Keep import button, chart, report and diagnostics functional. Use shadcn dashboard reference https://ui.shadcn.com/examples/dashboard. Clean, neutral, compact and accessible; no neon redesign.
6. Coordinate with PR3MM (`src/lib/ai.ts`) and Manish (model smoke verification); don't edit their exclusive files without agreement.
7. Check PRs, required `checks` CI, and integration after each merge; final live demo with real Temporal and real Jarvislabs or visibly labeled fallback.

Use 2–3 parallel `gpt-6-luna` subagents for **independent** discovery, validation and non-overlapping implementation; don't spawn agents editing the same paths as teammates. Parent Codex retains integration authority. Branch `feat/lead-*, open PR, require green checks; don't bypass branch rules.
