# Integration sprint — 2026-10-25

Started 10:51 UTC on Roojool's integration laptop. Branch: `feat/lead-mvp`.
No private environment file is changed or committed. Measurements in this report are synthetic unless explicitly identified otherwise.

## Preflight

- Clean main synchronized with origin at `1c5dcd5`; existing branches preserved.
- GitHub push permission confirmed. Main requires green `checks`, strict updates and administrator enforcement.
- Baseline: 4 tests pass, typecheck passes, production build passes.
- Jarvislabs live provider smoke passes with `gemma-4-31b-it`. This proves provider access only.
- An actual call to the original diagnostic adapter fails JSON parsing (`SyntaxError`, 4.34 seconds). It does **not** count as an AI diagnosis success.
- Existing loopback services: Next on 3000, Temporal on 7233, Temporal UI on 8233. The existing Next process serves a rule-based direct report for the synthetic sample (`score=4`, `deltaMs=183.5`, `aiUsed=false`, null workflow ID).
- Temporal CLI confirms the prior setup workflow `latencylens-setup-a077408b-c255-4b8f-812f-70a4fd755f8a` remains `COMPLETED` with 11 history events. At 11:00 UTC the diagnosis task queue has zero pollers. A worker must be started for the integrated demo.
- Kepler and its agent sidecar are running. Windows Computer Use cannot connect to its native pipe after retry/reset; actual Kepler workspace/log inspection is unverified. Do not present the process check as a successful Kepler agent session.
- PR3MM's report was absent at preflight. The user supplied it at 11:13 UTC: clean sync, clean install, 16 tests/typecheck/build, real provider smoke, heuristic API and actual coding-agent smoke passed. Push access was demonstrated; his unauthenticated `gh` is handled by the lead's authenticated session. The shared setup gate is closed. Kepler inspection remains an explicitly recorded tool blocker.
- Dependency audit still reports 4 findings (3 high, 1 moderate); fixes proposed by npm involve major Next/Zod changes. No forced upgrades during this local sprint.

## Scope and ownership

Lead: API/Temporal execution and tests, dashboard/components/styles, integration and operational documentation. PR3MM: scoring/sample/probe/Gemma and their tests. `src/lib/contracts.ts` stays unchanged.

The dashboard keeps the existing trace, JSON import, diagnosis, explicit source labels and missing-value `—`. Comparisons, history, auth, databases, deployment and major migrations are deferred.

## PR3MM adapter review

Pushed branch `feat/measurements-ai-mvp`, commit `45838ea`, was reviewed in an isolated worktree. Lead opened draft [PR #4](https://github.com/Roojool/LatencyLens/pull/4). Its 16 tests, typecheck and production build pass locally. A real Jarvislabs call with the synthetic fixture returned validated narrative (`aiUsed=true`, model `gemma-4-31b-it`) in 7.789 seconds, with unchanged score `4` and delta `183.5`.

PR3MM addressed privacy and completion-state review in `bc3956c`: target/notes are excluded and only `finish_reason=stop` is accepted. Its 18 tests pass. A real call through the stricter default adapter succeeded in 7.289 seconds. Lead also redacts free text in the shared Activity as defense in depth. PR #4 merged through green required CI at `08e7e75`; his later report confirms his gh authentication is resolved. The user supplied his independent setup report at 11:13 UTC. Local lead verification does not claim to inspect PR3MM's laptop.

## Repeatable local check

With the app listening on port 3000:

```powershell
node --import tsx scripts/verify-demo.mjs
node --import tsx scripts/verify-demo.mjs --require-ai --require-temporal
```

The script posts only the synthetic fixture, checks malformed-input rejection and unchanged deterministic arithmetic, and asserts mode/ID consistency. The strict command must fail unless a real validated AI diagnosis and Temporal-mode response are returned. Confirm the resulting workflow ID against Temporal history separately.

## Three-minute demonstration script

Use only states verified in the final evidence section; describe unavailable integrations as unavailable.

- **0:00–0:25:** Open Overview. Point out **Synthetic** before discussing any numbers. Explain idle versus loaded latency and the heuristic score; unknown measurements display `—`.
- **0:25–0:50:** Import a previously saved synthetic measurement JSON. Keep its synthetic label visible. Explain that import validates local JSON and does not fetch the target.
- **0:50–1:35:** Run diagnosis. Show the returned model ID only when `aiUsed=true`. Read the evidence and one cautious recommendation; the score remains deterministic and root cause is a hypothesis.
- **1:35–2:15:** Show the returned Temporal ID, then its completed execution in `http://localhost:8233`. Match IDs and point out the completed Activity. A direct/fallback result must be described as direct and must not display a workflow ID.
- **2:15–2:40:** Show the recorded bounded-fallback result and preserved warning. Keep healthy demo services running. Show Kepler's actual read-only process/log inspection only if it has been verified; otherwise disclose the access blocker.
- **2:40–3:00:** Summarize the working local path: import/sample → validated input → deterministic score → cautious diagnosis → traceable result. Do not imply a synthetic trace measures the venue network or that HTTPS timing is ICMP.

## Final integration evidence

- Verification preparation merged in [PR #5](https://github.com/Roojool/LatencyLens/pull/5), `44d71f9`.
- Bounded API/Temporal and privacy boundary merged in [PR #6](https://github.com/Roojool/LatencyLens/pull/6), `93dddc8`.
- PR3MM's reviewed adapter merged in [PR #4](https://github.com/Roojool/LatencyLens/pull/4), `08e7e75`.
- Responsive dashboard merged in [PR #7](https://github.com/Roojool/LatencyLens/pull/7), `7c39d53`. All required checks were green; no protection was bypassed.
- Integrated tests: **24 pass**; typecheck and production build pass. No dependencies or frozen contracts changed.
- Strict API smoke: `aiUsed=true`, `model=gemma-4-31b-it`, `workflowMode=temporal`, `score=4`, `deltaMs=183.5`, no warning, 16.715 seconds including first workflow execution. ID: `latencylens-9a599bdf-195e-4b8b-b939-8de06e30ab68`.
- That ID has 11 actual history events, including `ACTIVITY_TASK_COMPLETED` and `WORKFLOW_EXECUTION_COMPLETED`. Sanitized event-only evidence: `output/playwright/temporal-history-redacted.json`.
- Browser import of the synthetic fixture succeeded via keyboard Enter. Invalid JSON was rejected without replacing the current dataset. Import → API → deterministic score → validated Gemma → UI produced `latencylens-e78fdd93-7aec-4358-b59f-53fc2ff67c3e`.
- Desktop **1440×900** and mobile **390×844** inspected; mobile document width equals viewport width (390), no horizontal overflow. All limitations remain visible. Both production browser sessions reported zero console errors.
- An isolated app on port 3001, using only in-process overrides, displayed the actual direct fallback with both warnings, rule-based output and no workflow ID. The healthy Temporal service/worker stayed running.

Local screenshots are ignored artifacts: `output/playwright/desktop-temporal-gemma.png`, `mobile-temporal-gemma.png`, `direct-fallback-desktop.png`. They contain synthetic inputs and real model/workflow results, with no credentials or private network identifiers.

Kepler inspection remains **BLOCKED**: its process/sidecar are present, but the Computer Use native pipe is unavailable after retry/reset. Direct process checks and actual Temporal history are captured; they are not presented as Kepler agent evidence. No controlled worker outage or network probe was run. Four dependency advisories remain for coordinated work before public deployment.

## Exact startup

The configured ignored `.env.local` is preserved. These overrides affect only the terminal process. Reuse the currently running services; do not launch duplicate copies. For a fresh checkout, run `npm ci`, `npm run test`, `npm run typecheck`, `npm run build` before starting the app.

Terminal A (only if the dev service is not already listening on 7233/8233):

```powershell
& (Join-Path $env:LOCALAPPDATA 'Programs\temporal\temporal.exe') server start-dev --ip 127.0.0.1
```

Terminal B, from the repository:

```powershell
$env:TEMPORAL_ADDRESS='127.0.0.1:7233'
npm run worker
```

Terminal C, from the repository after `npm run build`:

```powershell
$env:TEMPORAL_ENABLED='true'
$env:TEMPORAL_ADDRESS='127.0.0.1:7233'
npm run start -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`; Temporal UI is `http://127.0.0.1:8233`. Run the strict check above. To create an importable synthetic fixture without running a probe:

```powershell
node --import tsx -e "const fs=require('node:fs');fs.mkdirSync('output',{recursive:true});fs.writeFileSync('output/sample-import.json',JSON.stringify(require('./src/lib/sample.ts').sampleMeasurement))"
```

Use `output/sample-import.json` with **Import JSON**. Keep the Temporal dev service running: its in-memory history disappears when restarted.

## Bounded execution verification

The lead-owned API/Activity integration passes 10 tests, typecheck and production build. Request input is capped at 128 KiB and five seconds. Workflow execution is capped at 40 seconds, RPC waiting at 43 seconds, connection at three seconds and direct diagnosis at 20 seconds; cleanup also has a finite bound. The UI budget must allow up to 72 seconds including input and cleanup.

Actual process-only failure checks against the local code (private files unchanged):

- Unreachable loopback service: `direct-fallback` in **3.031 seconds**.
- Real running Temporal service with zero worker pollers: `direct-fallback` in **40.111 seconds**.
- Both return null workflow ID, `aiUsed=false`, and retain both generic Temporal and AI warnings.
- A stalled-body test returns HTTP 408 in 5.013 seconds even when stream cancellation never settles.

Read-only reviewer found no P0/P1 blocker. These are real execution/fallback checks, not network readings.

## Baseline reproduction

Open `http://localhost:3000`, observe the synthetic label, then select **Run AI diagnosis**. The original configured Next process returns a rule-based report with the metrics above. Browser console only reports the absent favicon (404). The original Import control is not keyboard-focusable; dashboard work must correct it.

Local baseline screenshot: `output/playwright/baseline-desktop.png` (ignored, no secrets). This section describes the original screen; final evidence and commands are above.
