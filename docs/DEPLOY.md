# Local runbook

Complete [SETUP.md](SETUP.md) on both engineers' machines first. Use `npm ci`, preserve an existing ignored `.env.local`, and keep Temporal disabled during the initial heuristic smoke.

## Direct diagnosis
Run `npm run dev`, open `http://localhost:3000` and click **Run AI diagnosis**. With blank key/model and `TEMPORAL_ENABLED=false`, expect a synthetic heuristic report, `aiUsed=false`, `workflowMode=direct`, and null workflow ID.

## Jarvislabs
Each engineer privately configures their own key, exact available model ID and verified base URL in `.env.local`. Never use `NEXT_PUBLIC_`. Run `npm run setup:check` then `npm run setup:check -- --live-ai` to verify access; restart Next afterward. This smoke proves provider access; the app must still validate diagnostic JSON. Failure must remain a visible heuristic fallback.

## Temporal — Roojool
Use [official CLI installation instructions](https://docs.temporal.io/cli), then `temporal server start-dev` in one terminal and `npm run worker` in another. Worker reads `.env.local` through dotenv; restart it after env changes. Verify worker registration, enable `TEMPORAL_ENABLED=true`, restart Next, diagnose and match the returned ID to completed history in Temporal UI (normally local port 8233). Disable again if unhealthy. PR3MM does not need this stack locally.

## Probe — after PR3MM hardening
Do not run load traffic during setup. Use `npm run --silent probe > probe-output.json` so npm banners do not corrupt JSON; import it through the dashboard. Use only approved trusted endpoints and a network you are authorized to test. HTTPS timing includes DNS/TLS/server delay and may not saturate the link; never claim formal ICMP/bufferbloat results. Current starter needs planned endpoint/byte-limit hardening.

## Hosting
Local Next + Temporal + Worker first. A hosted frontend cannot reach a laptop-only worker. Persistent orchestration and a secured backend are future work.