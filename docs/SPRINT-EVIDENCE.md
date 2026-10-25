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
- PR3MM's initial independent PASS report has been requested; no open PR/report was available in this repository at preflight. Shared setup gate remains pending until that evidence arrives.
- Dependency audit still reports 4 findings (3 high, 1 moderate); fixes proposed by npm involve major Next/Zod changes. No forced upgrades during this local sprint.

## Scope and ownership

Lead: API/Temporal execution and tests, dashboard/components/styles, integration and operational documentation. PR3MM: scoring/sample/probe/Gemma and their tests. `src/lib/contracts.ts` stays unchanged.

The dashboard keeps the existing trace, JSON import, diagnosis, explicit source labels and missing-value `—`. Comparisons, history, auth, databases, deployment and major migrations are deferred.

## PR3MM adapter review

Pushed branch `feat/measurements-ai-mvp`, commit `45838ea`, was reviewed in an isolated worktree. Lead opened draft [PR #4](https://github.com/Roojool/LatencyLens/pull/4). Its 16 tests, typecheck and production build pass locally. A real Jarvislabs call with the synthetic fixture returned validated narrative (`aiUsed=true`, model `gemma-4-31b-it`) in 7.789 seconds, with unchanged score `4` and delta `183.5`.

Merge is blocked on excluding arbitrary `target`/`notes` strings from provider input; the draft review requests a sentinel privacy test. PR3MM's independent initial setup attestation was not present in the pushed branch and has been requested separately. This local lead verification does not claim to inspect PR3MM's laptop.

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

## Verification still required

- Bounded no-worker and unavailable-service fallback; generic safe errors and preserved warnings.
- Review PR3MM's PR, including diagnostic JSON validation, finite timeout, unchanged deterministic arithmetic and exclusion of free-text/private target/notes from model input.
- Actual validated Gemma diagnosis and a completed Temporal workflow matching the API's returned ID.
- Sample/import → API → score → diagnosis → UI; desktop 1440×900 and mobile 390×844.
- Final `npm run test`, `npm run typecheck`, `npm run build`; protected PR merge with green required checks.

## Baseline reproduction

Open `http://localhost:3000`, observe the synthetic label, then select **Run AI diagnosis**. The original configured Next process returns a rule-based report with the metrics above. Browser console only reports the absent favicon (404). The original Import control is not keyboard-focusable; dashboard work must correct it.

Local baseline screenshot: `output/playwright/baseline-desktop.png` (ignored, no secrets). Final evidence and demo commands will be recorded after integration.
