# LatencyLens — Evidence-led AI Network Diagnostics

A three-hour Hacktoberfest Hack Day Pune 2026 starter. Four developers build in parallel using Kepler (infrastructure development), Temporal (durable orchestration), and Jarvislabs Gemma 4 (server-side diagnostics).

## Quick start

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. Synthetic sample is clearly labeled. Press **Run AI diagnosis**. The rule-based path works without API keys or Temporal.

## Public GitHub bootstrap (owner machine)

Install GitHub CLI (`gh`) and sign in with `gh auth login`. In THIS extracted folder on Windows PowerShell:

```powershell
.\scripts\bootstrap-public.ps1 -Owner Roojool -Repo LatencyLens -Teammates @('COLLABORATOR_2','COLLABORATOR_3','COLLABORATOR_4')
```

Replace collaborators with **real GitHub usernames** and ensure each accepts invitation. This creates `https://github.com/Roojool/LatencyLens` as a **public** repo, pushes the starter, enables squash/auto-merge, and attempts to protect main with mandatory `checks` CI. If GitHub API permissions or plan settings block protections, fix them in GitHub Settings BEFORE accepting PRs. **Do not consider auto-merge operational until the branch rule and CI have been verified.**

For safety, `.github/workflows/auto-merge.yml` only queues non-draft same-repo `feat/*` PRs authored by trusted collaborators and excludes security/dependency/contract files; protected main waits for green CI. No auto-approval bypass.

## Team handoff

1. Each person clones the public repo, runs `npm install`, and reads `AGENTS.md`.
2. Lead opens `prompts/01-coordinator-ui.md` with agent; teammate 2 uses `02-measurements.md`; teammate 3 `03-temporal.md`; teammate 4 `04-gemma-jarvis.md`.
3. Create own `feat/role-task` branches. Commit, push, open PR. The bot queues eligible PRs for green-check auto-merge; a separate workflow attempts clean branch refreshes after merges (never force-pushes).
4. `docs/TASKS.md` is the sprint board; `docs/CONTRACTS.md` freezes integration types.

## Actual sponsor integration

- Kepler: AI infrastructure IDE for diagnosing local dev/Temporal issues. It is NOT embedded as a sensor.
- Jarvislabs: credentials and exact model ID go only in server env; uses `https://models.jarvislabs.net/v1` through OpenAI SDK.
- Temporal: run local Temporal server (`temporal server start-dev`), then `npm run worker`, set `TEMPORAL_ENABLED=true`, restart Next. See `docs/DEPLOY.md`.

## Local limited timing probe

```powershell
npm run probe > probe-output.json
```

Import the JSON from the dashboard. HTTPS timing under bounded background downloading is a rough proxy, **not formal ICMP RTT nor proof of bufferbloat**. Only measure networks you own or are authorized to assess. Defaults are limited to two 3-MB downloads, small timing batches and short request timeouts.

## Project intent

An accessible way for developers and everyday users to understand loaded-latency inflation, jitter, and possible network queueing issues. The numerical score is a documented heuristic, not a certified performance grade. The default trace is synthetic and explicitly labeled.

## Stack

Next.js + React + TypeScript + Zod, Node HTTPS probe, Temporal TypeScript SDK (optional runtime), Jarvislabs Gemma 4 via OpenAI-compatible API. MIT license.

See `docs/UI-DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOY.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`.
