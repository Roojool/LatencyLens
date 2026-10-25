# Kepler demonstration / operator runbook

1. First make ordinary E2E demo work. Open the local Next app at http://localhost:3000, Temporal Web UI (typically http://localhost:8233), confirm one real completed diagnosis and note workflow ID.
2. Ensure `TEMPORAL_ENABLED=true` only after `temporal server start-dev` and `npm run worker` are running. Config is local only, ignored .env.local.
3. With operator approval Ctrl+C **only** the dedicated worker terminal, leaving Temporal service/Next alive.
4. Trigger diagnosis, observe pending Workflow/timeout in Temporal UI. Use Kepler to inspect process and error logs. Require evidence-based root cause, not guesses.
5. Request approval to restart `npm run worker`. Observe Temporal continuation; if web request timed out, run another diagnosis to confirm fresh success.
6. Screenshots: operational investigation (redacted), Temporal workflow pending/completed, LatencyLens network diagnosis.

Safety: no credentials in screenshots, no OS/router/firewall modifications, don't kill all Node processes. Stop failure demo near submission deadline. If Temporal isn't yet integrated, use Kepler to diagnose an actual `npm run typecheck` or Worker startup problem instead.
