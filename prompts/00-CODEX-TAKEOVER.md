# CODEX MASTER TAKEOVER — LatencyLens Hack Day

**Repository:** https://github.com/Roojool/LatencyLens
**Owner:** Roojool (W1); other humans: PR3MM (W2), tanvijarande (W3), manishkhullar (W4).
**Visual target:** https://ui.shadcn.com/examples/dashboard
**Priority:** deliver a working, accurate demo. Do **not** merely write a plan.

You are the technical commander, coding integrator and release engineer. Complete the execution using your available tooling and focused gpt-6-luna subagents; if unavailable, perform sequentially without pretending.

## FIRST READ (in order)
`AGENTS.md`, `docs/ROLE-MAP.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`, `docs/ARCHITECTURE.md`, `docs/UI-DESIGN.md`, `docs/DEPLOY.md`, `prompts/01-coordinator-ui.md`, `kepler.md`.
Inspect `git status`, `git branch`, `gh pr list`, recent CI, `package.json`, current API & temporal files. Never overwrite uncommitted work.

## TEAM OWNERSHIP (do not reassign)
- W1 Roojool/Codex, **~50%**: Temporal server/worker/workflow, Next API, install shadcn, common deps, UI page integration, Kepler, CI/review, demo.
- W2 PR3MM **~35%**: `src/lib/scoring.ts`, `src/lib/sample.ts`, `src/lib/ai.ts`, `scripts/probe.mjs`, scoring/AI tests, network comparisons.
- W3 Tanvi **~10%**: only new `src/components/dashboard/**` presentational shadcn-style components.
- W4 Manish **~5%**: local Jarvislabs availability check and `docs/JARVISLABS-SMOKE.md`; mock test if easy. No core runtime edits.
- Keep `src/lib/contracts.ts` frozen without explicit lead signoff.

## SUBAGENT STRATEGY
Use 2–3 `gpt-6-luna` subagents simultaneously where supported and useful:
A. **Temporal verifier/implementer:** inspect and implement `src/temporal/**`, `src/app/api/diagnose/route.ts` only. Provide actual workflow ID and failure recovery; never edit PR3MM files.
B. **shadcn setup advisor or dependency worker:** initialize shadcn in existing Next.js app, add just minimal primitives; own config/dependencies/`src/components/ui/**` only. DO NOT touch Tanvi's `src/components/dashboard/**`.
C. **read-only quality reviewer:** independently evaluate metrics provenance, CI, security, runtime UX and demo gaps. Report exact fixes without editing teammates' paths.
Parent Codex owns `src/app/page.tsx`, integration, branch coordination and final smoke tests. Subagents share working-tree state in many Codex environments: use isolated git worktrees for simultaneous write tasks or serialize writes, never parallel-edit same paths. Prefer read-only agents if isolation unsupported. Don't assume subagents bypass GitHub repo permissions.

## EXECUTE
1. Confirm protected public repo is accessible and check open PRs/branches. Do not reset ongoing changes or push directly to protected main.
2. Run baseline `npm ci`, `npm run test`, `npm run typecheck`, `npm run build`; record failures honestly.
3. Create `feat/lead-temporal-shadcn` from fresh main (or non-conflicting feature branch).
4. Start parallel subagents on bounded scopes. Initialize shadcn via its current official Next.js procedure **in the existing project**; confirm actual package versions and choose minimal `card`, `button`, `badge`, `separator`, `sidebar` if feasible. Announce usable component paths to Tanvi.
5. Implement and verify one genuine Temporal workflow in local development. Local dev service, Worker, Next route and activity must cooperate; model API calls must happen in Activities (not deterministic Workflow code). Keep retries/timeouts bounded, explicit `workflowMode` and `workflowId`, and user-visible direct fallback.
6. Ask Manish for verified model ID and send to PR3MM; PR3MM owns Gemma code. Never solicit or print keys. Verify actual model success or clearly label `aiUsed=false`.
7. After Tanvi's PR passes checks, integrate her components into `src/app/page.tsx` without losing import/diagnose functionality; follow shadcn dashboard visual direction: neutral panels, sidebar, compact cards, truthful chart and workflow status.
8. Add Kepler runbook instructions and try a **safe** operations demonstration after stable live E2E, not during the last 25 minutes. Kepler is a separate SRE IDE, not an embedded API.
9. Push small PRs, inspect `gh pr checks` and only merge after required `checks` green. Do not bypass protection. Auto-merge may queue eligible changes; CI failures require fixes.
10. Run complete smoke: sample/import/probe, heuristic mode, Gemma, real Temporal workflow ID, graceful Worker outage/recovery if safe, responsive UI, README and judge script. Preserve backup fallback.

## ACCEPTANCE BAR
- `npm run test`, `npm run typecheck`, `npm run build` pass on merged main.
- Dashboard resembles shadcn example without pretending dead controls work.
- Sample data clearly synthetic; local HTTPS timings not presented as ICMP or official bufferbloat grading.
- `aiUsed=true` only after a real successful Jarvislabs request.
- `workflowMode=temporal` only when a real Temporal workflow completes and returns an ID.
- Kepler is visibly used to inspect/repair local service issues, only with approval.
- Open PR URLs and CI status are reported. No API keys in Git history.
- Finish implementation and evidence, not a further planning essay.

## COMMANDS
```powershell
git status
gh pr list --repo Roojool/LatencyLens
npm ci
npm run test
npm run typecheck
npm run build
npm run dev
# separate terminals after Temporal CLI installed:
temporal server start-dev
npm run worker
```

Stop adding features when the demo becomes fragile. Communicate genuine blockers succinctly and ship a repeatable E2E path.
