# Setup gate — Roojool and PR3MM

Complete independently before feature implementation. Never paste keys into chat, PRs, logs or screenshots. A missing account/credit/tool is BLOCKED, not verified.

## Both engineers
Before the numbered checks, synchronize each device independently. The lead agent cannot see the other laptop's filesystem. If `git status --short` shows changes, preserve them and ask your own agent to coordinate the update; never reset or overwrite them. With a clean tree:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

The last two hashes must match. A feature branch may be ahead of main; preserve its work and integrate updates through that branch/PR rather than treating it as disposable. Read [TOOL-STATUS.md](TOOL-STATUS.md) for current evidence and the build-release gate.

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

Kepler smoke on each installed device: finish installation/sign-in, open THIS clone, ask its agent to read `docs/ROLE-MAP.md` and run `git status --short --branch` plus `npm run typecheck`. Confirm it actually executes the commands and reports their real results. Do not give it `.env.local`, credential contents or screenshots of secrets. An installed application or successful login alone does not prove a working agent session.

## Roojool only
- Confirm `.codex/agents/` roles load in your signed-in agent and model access is available. Configured `gpt-6-luna` roles are optional; report unavailable roles and proceed sequentially when authorized. Existing standalone agent files follow [official OpenAI documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- Install/verify Temporal using its [official CLI instructions](https://docs.temporal.io/cli). Run `temporal server start-dev` in one terminal and `npm run worker` in another. Verify worker registration in local Temporal UI. Only then enable Temporal in `.env.local`, restart Next and verify an actual completed diagnosis workflow with matching ID/history. Turn it off again if unhealthy. Current starter may need the planned bounded-fallback fixes; report those separately.
- Open/sign into Kepler separately; verify it can inspect this workspace/logs. An absent shell command alone does not prove the GUI is missing. Kepler account access is a manual check; it is not a runtime API dependency.
- PR3MM needs neither Temporal nor Kepler on his machine. Tanvi/Manish need no engineering setup.

PR3MM may use his installed Kepler as his coding agent and verify it with the smoke above. Temporal needs to run only on Roojool's integration laptop for this local demonstration. A local Temporal dev service needs no Temporal Cloud account or API key. Its default database is in memory; restarting the service loses that demo history unless you explicitly configure persistence outside the repository.

## Three terminals on Roojool's laptop
After the CLI is installed and setup reports are accepted:
1. Terminal A: `temporal server start-dev --ip 127.0.0.1` (service on loopback port 7233; UI at `http://localhost:8233`). Keep it running. Roojool's verified user-local install can be invoked without changing PATH:

   ```powershell
   $temporalCli = Join-Path $env:LOCALAPPDATA 'Programs\temporal\temporal.exe'
   & $temporalCli --version
   & $temporalCli server start-dev --ip 127.0.0.1
   ```

   If the service is already running from setup verification, reuse it rather than starting a second copy.
2. Terminal B in this repo: `npm run worker`. Wait for the worker-ready message. Restart this worker after changing its env or application code.
3. Terminal C in this repo: `npm run dev`. Open `http://localhost:3000`. After an actual successful workflow smoke, set `TEMPORAL_ENABLED=true` locally and restart Next. A real diagnosis must show `workflowMode=temporal` and a workflow ID matching completed history in Temporal UI.

Use the official [Temporal CLI setup guide](https://docs.temporal.io/cli/setup-cli). The shared [github-actions-ai-agent repository](https://github.com/LondheShubham153/github-actions-ai-agent) is a separate Python/Ollama/Supermemory example, useful for concepts; its dependencies and `.env` are not this application's setup requirements.

## Agent build release
Once both devices have matching main hashes, passing local checks/live provider access and verified coding-agent sessions, Roojool confirms release. Then both can implement concurrently:
- Roojool: `prompts/00-CODEX-TAKEOVER.md`, starting bounded Temporal/API orchestration and dashboard integration.
- PR3MM: `prompts/02-measurements.md`, starting the diagnostic JSON failure described in `TOOL-STATUS.md`, then scoring/probe hardening.

Keep each role on its own `feat/*` branch. Open small PRs and require green `checks`. A tool smoke is a setup check, not proof the unfinished application's complete flow already works.

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
