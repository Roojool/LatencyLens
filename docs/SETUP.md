# Setup gate — Roojool and PR3MM

Complete independently before feature implementation. Never paste keys into chat, PRs, logs or screenshots. A missing account/credit/tool is BLOCKED, not verified.

## Both engineers
1. Use Node 22+ (CI uses 22), npm, Git, GitHub CLI and your coding agent. Verify the agent can read the repository and run a harmless command. Codex is optional for PR3MM; no OpenAI API key is required for this Jarvislabs application.
2. Clone `https://github.com/Roojool/LatencyLens.git` or fetch an existing clone without discarding changes. Run `gh auth status`; confirm write access with `gh api repos/Roojool/LatencyLens --jq .permissions.push` (must be `true`). Do not print auth tokens.
3. Run `npm ci`, `npm run test`, `npm run typecheck`, `npm run build` sequentially. Report actual failures. Create your role branch before edits.
4. Create the ignored local environment only if absent (PowerShell):

   ```powershell
   if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
   git check-ignore .env.local
   ```

   Keep `TEMPORAL_ENABLED=false` initially. Never add a `NEXT_PUBLIC_` key or commit this file.
5. First test the heuristic path with key/model blank and Temporal disabled: `npm run dev`, open `http://localhost:3000`, confirm SYNTHETIC source, click **Run AI diagnosis**, inspect `/api/diagnose` response. Expect `diagnosis.aiUsed=false`, `workflowMode=direct`, `workflowId=null`, with a usable report. Stop/restart this app after editing env. Do not run the load probe during setup.
6. Sign into your OWN [Jarvislabs Token Factory account](https://jarvislabs.ai/products/models). Verify available credits and model access, create an API key privately, copy the exact catalog model ID and account-provided API base URL into `.env.local`. Preferred model family: Gemma; do not guess an identifier from its display name. The provider documents an OpenAI-compatible Chat Completions API; account access still needs a real check.
7. Run `npm run setup:check`. It checks runtime and configuration without sending requests; success here does NOT prove API access. Then run `npm run setup:check -- --live-ai` for ONE small, bounded real completion (may consume credits). The script accepts only the trusted `https://models.jarvislabs.net/v1` endpoint and never logs key/model response bodies. If the account supplies a different endpoint, coordinate with Roojool rather than bypassing validation. No retries are performed.
8. Share the sanitized report below with Roojool. Both reports must pass before feature work. A provider smoke proves connectivity/model access; validated diagnostic JSON remains PR3MM's implementation acceptance criterion.

## Roojool only
- Confirm `.codex/agents/` roles load in your signed-in agent and model access is available. Configured `gpt-6-luna` roles are optional; report unavailable roles and proceed sequentially when authorized. Existing standalone agent files follow [official OpenAI documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- Install/verify Temporal using its [official CLI instructions](https://docs.temporal.io/cli). Run `temporal server start-dev` in one terminal and `npm run worker` in another. Verify worker registration in local Temporal UI. Only then enable Temporal in `.env.local`, restart Next and verify an actual completed diagnosis workflow with matching ID/history. Turn it off again if unhealthy. Current starter may need the planned bounded-fallback fixes; report those separately.
- Open/sign into Kepler separately; verify it can inspect this workspace/logs. An absent shell command alone does not prove the GUI is missing. Kepler account access is a manual check; it is not a runtime API dependency.
- PR3MM needs neither Temporal nor Kepler on his machine. Tanvi/Manish need no engineering setup.

## Sanitized report template
```text
Engineer / branch / commit:
Node / npm / Git / gh / coding agent: PASS or BLOCKED
Repository push permission: PASS or BLOCKED
npm ci / test / typecheck / build: actual results
Heuristic UI → API → report: PASS or BLOCKED
Ignored .env.local: PASS or BLOCKED
Jarvislabs exact model ID (non-secret):
setup:check / --live-ai: PASS or BLOCKED (no keys or raw errors)
Roojool only — Temporal completed workflow / Kepler access:
Blocker and next private action:
```

## Initial audit, 2026-10-25
Roojool: Node 24.13.0, npm 11.19.1, authenticated GitHub CLI, Codex CLI 0.164.0. Initial tests/typecheck/build pass. PR3MM already has GitHub write access. Main is protected with required `checks`, strict updates and admin enforcement. Local ignored `.env.local` created with blank key/model; Temporal CLI missing; Kepler GUI/account unverified. Roojool confirmed neither engineer's Jarvislabs access is verified. PR3MM's machine must still complete every check above.

Clean `npm ci` succeeds. `npm audit` reports 4 dependency findings (3 high, 1 moderate) involving Zod/OpenAI and PostCSS/Next. Suggested fixes include major upgrades; coordinate and validate them before public deployment rather than running `npm audit fix --force` or silently changing the frozen contract. Setup success does not mean these advisories are resolved.

Takeover smoke: homepage HTTP 200; synthetic `/api/diagnose` HTTP 200 with `aiUsed=false`, `workflowMode=direct`, null workflow ID and `deltaMs=183.5`; invalid input HTTP 400. Interactive browser verification remains pending because no browser surface was available in the agent session. This HTTP check does not complete either engineer's full setup gate.
