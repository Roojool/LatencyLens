# LatencyLens sprint board — ACTIVE / reassigned

**Active owner map:** `docs/ROLE-MAP.md`. **Codex takeover:** `prompts/00-CODEX-TAKEOVER.md`. Old W3 Temporal assignment is retired; Roojool owns Temporal.

| Priority | Owner | Task | Acceptance |
|---|---|---|---|
| P0 | Roojool + Codex | Keep app running, bootstrap shadcn/ui in existing Next.js app (do not recreate app), Temporal server + Worker + diagnosis route, Kepler runbook, integrate all PRs | local demo, real workflow ID and protected main |
| P0 | PR3MM | Fix/test measurement scoring, safe bounded probe, healthy-vs-loaded fixtures, own Gemma analysis implementation | defensible metrics and model result never fabricated |
| P0 | Tanvi | shadcn dashboard presentational components only, no API/state/dependency work | screenshot + responsive KPI/sidebar/chart/report shell; PR isolated to `src/components/dashboard/**` |
| P0 | Manish | Confirm Jarvislabs exact model/base URL through private account; one live smoke test locally; document sanitized findings | small doc/mock test PR; no secrets; no runtime edits |
| P1 | Roojool + Codex | Wire Tanvi's components into existing `src/app/page.tsx`, true integration statuses, Temporal retry and Kepler recovery demo | repeatable actual end-to-end flow |
| P1 | PR3MM | Before/after comparison and accuracy tests | labeled synthetic vs actual measurement |
| P1 | Tanvi | polish only after P0 merged | accessible desktop/mobile screenshot |
| P1 | Manish | verify AI fallback and JSON validation; review evidence | clear `aiUsed` truthfulness |

### Parallelism
1. Roojool/Codex work on `src/temporal/**`, API, shadcn installation/dependencies and integration. W1 owns any config files changed by shadcn CLI. Separate Codex Luna subagents by non-overlapping paths or READ-ONLY scans.
2. PR3MM works on probe/scoring/`src/lib/ai.ts`. Coordinate main AI code ownership. W4 only verifies.
3. Tanvi adds separate `src/components/dashboard/**`. W1 integrates UI AFTER Tanvi's PR, unless they agree on stable component exports.
4. Manish submits redacted Jarvislabs smoke notes and one mock/fixture test without printing or committing keys.

### Guardrails
- `src/lib/contracts.ts` frozen. Don't change without coordinator approval.
- PRs green on `npm run test`, `npm run typecheck`, `npm run build`. No bypassing required check `checks`.
- Never misrepresent HTTPS timings as ICMP ping or formal bufferbloat measurement.
- Stop feature additions once integration/demo is at risk. Prefer working fallback to broken fancy UI.
- No native .exe, accounts, auth, or DB for today's demo.

### Lead every 10–15 minutes
`gh pr list --repo Roojool/LatencyLens`; review CI, merge conflicts and branch status; test local E2E after each merge; keep judge demo reproducible.
