# Active ownership — 25 Oct 2026

The former W1 UI / W3 Temporal split is **superseded** by this table. Work is intentionally weighted towards Roojool and PR3MM to conserve Tanvi's and Manish's subscriptions.

| Person | Scope | Approx effort | Exclusive paths |
|---|---|---|---|
| W1 Roojool + Codex | Lead, Kepler, Temporal, API route, shadcn setup/dependencies, UI integration, GitHub, final test/demo | 50% | `src/temporal/**`, `src/app/api/diagnose/route.ts`, `src/app/page.tsx`, shared config, `docs/KEPLER-OPERATIONS.md` |
| W2 PR3MM | Network measurement, scoring, probes, healthy/loaded scenarios, main Gemma analysis code | 35% | `src/lib/scoring.ts`, `src/lib/sample.ts`, `src/lib/ai.ts`, `scripts/probe.mjs`, `tests/scoring.test.ts`, new metrics/AI tests |
| W3 Tanvi (`tanvijarande`) | UI-only **presentational** shadcn dashboard components | 10% | New `src/components/dashboard/**`, optional `src/components/dashboard/dashboard.css` |
| W4 Manish (`manishkhullar`) | Jarvislabs/Gemma model availability smoke verification, redacted evidence, tiny fixture test & docs | 5% | `docs/JARVISLABS-SMOKE.md`, `tests/jarvis-smoke.test.ts` (non-live/mock), no `src/lib/ai.ts` edits |

W1 installs/configures shadcn dependencies and primitives; Tanvi MUST NOT edit `package.json`, lockfile, global CSS, `src/app/page.tsx`, `src/components/ui/**` or `src/lib/contracts.ts`. She can deliver components that accept typed props from existing contracts or locally declared view types. W1 wires those components to real state.

W2 owns `src/lib/ai.ts`; W4 should report API issues as a comment/PR and coordinate, not rewrite it. Never reveal the private Jarvislabs key to teammates or commit it.

**Do not abandon a feature branch already in progress.** If old work exists, coordinate scope; don't reset or overwrite a teammate's code. Open separate `feat/*` branches and PRs, let CI run, then auto-merge only safe PRs. Mandatory human inspection for shared dependencies, `.github/**`, and contracts.

## Team start messages
- **Roojool:** Use `prompts/00-CODEX-TAKEOVER.md` in Codex; `prompts/01-coordinator-ui.md` is his detailed role.
- **PR3MM:** Use `prompts/02-measurements.md`.
- **Tanvi:** Use `prompts/06-tanvi-dashboard.md` ONLY.
- **Manish:** Use `prompts/04-gemma-jarvis.md` ONLY.

All four read `AGENTS.md` and `docs/CONTRACTS.md` before touching code.
