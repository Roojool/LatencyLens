# LatencyLens | Three-hour four-person Hacktoberfest build plan

**Mission:** evidence-based analysis of latency-under-load with an explainable Gemma 4 report, an actual Temporal workflow, and Kepler-assisted infrastructure operations. Public MIT-licensed repository. Start with a browser-based app; add a native client later.

## Format decision

| Delivery target | Today | Why |
|---|---|---|
| Web UI on laptop (`localhost:3000`) | YES | Fastest working showcase, responsive on phones using local network if exposed safely |
| Local Node HTTPS probe / JSON import | YES | Browser alone cannot do ICMP or controlled-load router diagnostics |
| Cloud-hosted public demo | ONLY IF STACK ALREADY WORKS | A serverless Next page cannot reach a laptop-only Temporal Worker |
| PWA | Post-event | Shareable, installable shell but no arbitrary OS probes |
| Tauri Windows `.exe` | Post-event | Local Rust probes, tray/background service, data portability; much less packaging overhead than Electron |
| React Native / Expo | Post-event | Android/iOS UX; platform-specific sensor/network capabilities need separate verification |

## Product differentiator

The differentiator is an **evidence-to-action** flow, not a text-only chatbot: measured loaded latency vs idle -> deterministic inflation/jitter rules -> Gemma explanation grounded in those facts -> Temporal history / retries -> concrete verification plan -> (future) before-and-after SQM comparison.

### First three-hour MVP
1. Four KPI cards: idle latency, loaded latency, added latency, heuristic score.
2. Idle vs loaded chart with visible provenance (SYNTHETIC SAMPLE / LOCAL HTTPS PROBE).
3. Two diagnosis modes: deterministic baseline, Jarvislabs-hosted Gemma 4 when credentials and model ID provided.
4. A working Temporal diagnosis workflow, visible in Temporal UI, with real workflow ID and bounded retry.
5. Import limited real local probe measurement JSON generated on operator laptop; do not falsely claim browser ICMP.
6. README, public GitHub, screenshots, MIT license, 2–3 minute live demo and backup video.

### P1 if integration stable
- Before/after comparison of two measurement JSON files, difference in added ms and score.
- Report export (.md or JSON) with measurement provenance and caveats.
- Failure & recovery demonstration by restarting Worker, watching Temporal recover, and Kepler explaining logs.
- Model explanation with short evidence bullets and prioritized, read-only fixes.

### P2 after hackathon
- Actual OS-level ICMP/UDP/QUIC probe + opt-in controlled capacity-saturating latency-under-load tests.
- Private local agent (Tauri) and secure browser pairing; Android/Expo companion.
- SQM/CAKE/fq_codel configuration guidance without auto-changing device.
- Connection trends over days, connection type (Wi-Fi/5G/fiber), device comparison.
- Correlated Wi-Fi signal/channel congestion vs upstream queuing, only with appropriate sensors.
- Cross-network community benchmarks with opt-in anonymized aggregates and explicit privacy safeguards.
- WebRTC calls/gaming-focused QoE forecasts trained on measured datasets; explain uncertainty.
- BufferbloatShaper import/export adapter (separate repository, don't modify ongoing Stage 1 work).

## Sponsor tools exactly

**Kepler / RubixKube**: log/code/devops workspace, diagnose local Temporal startup, review suggested shell fixes before approval, check npm/Node env and network behavior, produce a recorded operational recovery story. Kepler is NOT used as a runtime sensor. Obtain the separate Kepler pass/social bonus independently.

**Temporal**: `POST /api/diagnose` starts the real TypeScript `diagnosisWorkflow` on `latencylens-diagnostics`; Worker executes `diagnoseActivity`, which computes deterministic analysis and calls Jarvislabs when configured. Workflow retries a transient LLM error with exponential backoff. Operational auditability is the selling point. When disabled/unavailable, UI reports direct mode and does not claim real Temporal execution.

**Jarvislabs Token Factory**: hosted Gemma 4 model via OpenAI-compatible Chat Completions API. `JARVISLABS_API_KEY` and the exact chosen model ID are server-side environment variables. Model may explain evidence and recommend safe steps but may NOT alter computed arithmetic or claim unproven root causes. Evaluate two model options after E2E works, never before.

## First 15 minutes

1. Coordinator: Extract starter, run `gh auth login` if not already authenticated, `./scripts/bootstrap-public.ps1 -Owner Roojool -Repo LatencyLens -Teammates @('username2','username3','username4')`. All accounts accept invite.
2. Everyone: Clone, `npm ci` (once generated lock present), `Copy-Item .env.example .env.local`, `npm run dev`.
3. Check branch protection is active. Check `Settings → Actions → General → Workflow permissions` allows necessary `GITHUB_TOKEN` write permissions, and auto-merge is enabled. If denied, manually enable permission and keep protective rules; never bypass CI.
4. Each of four teammates opens their individual `prompts/0*.md` in their preferred AI coding agent, says “Follow AGENTS.md and stay within my owned files.”
5. Freeze `src/lib/contracts.ts` once all teammates are running.

## Assignment and branch strategy

| Developer | Branch prefix | Owns | 60-minute output |
|---|---|---|---|
| W1 lead/UI | `feat/ui-` | Next interface, docs, screenshots, integration | polished main dashboard & coordinator |
| W2 metrics | `feat/measurements-` | scoring, fixtures, probe, tests | accurate, bounded measurements / import |
| W3 Temporal | `feat/temporal-` | workflow, activities, Worker, API route | actual workflow ID, retry and status |
| W4 AI | `feat/gemma-` | Jarvislabs call, output validation, AI tests | real Gemma analysis or truthful fallback |

No one should overwrite any other person's owned paths. Contract and dependency changes are manual review. Each agent: read prompt → implement one testable slice → run local checks → commit on own branch → push → create PR → relay URL to coordinator; do not loop forever if blocked.

## Auto-merge and merge race conditions

`main` is protected; CI job named `checks` is required. A PR is queued for squash auto-merge only if all conditions hold: same repository, trusted GitHub contributor, branch `feat/*`, non-draft, and no changes to security/workflow, dependency manifests, contract, or bootstrap files. A push-to-main workflow attempts clean branch updates when `main` changes. Conflicting branches or failed checks remain unmerged; coordinator resolves manually. This is intentionally not “merge all PRs blindly.”

Never enable auto-merge before mandatory checks and branch protection are confirmed. Never use a PAT in workflows for this purpose when GitHub's scoped `GITHUB_TOKEN` can do the job.

## 3-hour time-box

- T+0–15: public repo and collaborator invitations, model key and Kepler credentials, startup check, challenge criteria.
- T+15–30: freeze contracts; all agents branch and own their area.
- T+30–75: parallel implementation; first PRs, real API smoke tests, dark dashboard.
- T+75–110: merge P0, run full end-to-end; watch actual Temporal execution; compare real vs sample and label correctly.
- T+110–135: Kepler troubleshooting proof, retries, one P1 differentiator and UX polish.
- T+135–155: run tests, failure fallback, test a fresh clone, hide credentials and validate documentation.
- T+155–180: get submissions and screenshots ready, record backup video, rehearse 2–3-minute demo; stop code changes.

## Visual direction

Dark, minimal network-operations console, not generic AI chat. Navy `#0b1422`, teal/cyan `#55d8da`, amber `#f9ab66`, mint `#74d4b1`; crisp mono metrics, subtle dividers, narrow left sidebar. Hero timeline with observed loaded/idle bands; compact cards; diagnosis panel aligned with an execution/evidence panel. Keep the SYNTHETIC vs LOCAL distinction in the hero. Loading should show stage status; failures should show direct fallback without lying.

## Demo script (2–3 minutes)

- 0:00–0:20: “Your internet says 50 Mbps, but meetings lag under load. LatencyLens shows why.”
- 0:20–0:55: show synthetic trace, 24.5 ms baseline vs 208 ms loaded, marked demo; then import a real local HTTPS probe JSON if ready.
- 0:55–1:35: click Diagnose, see deterministic metrics + Gemma 4 explanation (not fake model calls).
- 1:35–2:10: open Temporal Web UI; show Workflow ID, completed Activity, optionally a staged retry.
- 2:10–2:35: show Kepler diagnosing/read logs of the local Worker failure and proposing an approved fix.
- 2:35–3:00: “Today is visibility; next is before-after queue management experiments, native probe, and open-source contributions.” GitHub page and README.

## Known gaps in provided starter

- `npm install`, Next build, and external API integration require working network and Jarvislabs credentials on a team laptop. Dependency installation could not be fully verified in the isolated artifact environment.
- Temporal and Kepler are not launched automatically by this archive; follow runbook.
- The local HTTPS probe is illustrative, not a precise ICMP/bufferbloat diagnostic; improve sensor before publishing research conclusions.
- GitHub repository bootstrap script requires an authenticated `gh` CLI with permission to create a public repo. Invitation recipients must accept before they become collaborators.

**Stop rule:** At T+120, if one tool is still unreliable, preserve a truthful fallback and demonstrate the successful layers rather than simulate results or disguise missing integrations.
