# Runbook / deployment

## Fast local demo
- `npm install`
- `cp .env.example .env.local` (on Windows PowerShell: `Copy-Item .env.example .env.local`)
- `npm run dev`
- visit http://localhost:3000
- click Run AI diagnosis: deterministic fallback works with no credentials.

## Gemma 4 through Jarvislabs
Set `JARVISLABS_API_KEY` and EXACT `JARVISLABS_MODEL` from https://jarvislabs.ai/products/models in `.env.local`. Never use `NEXT_PUBLIC_` prefix. Restart the app. Model JSON is validated. API failure shows deterministic fallback and warning.

## Temporal
Temporal CLI install docs https://docs.temporal.io/cli ; start server `temporal server start-dev` (uses port 7233, Web UI typically 8233). New terminal: `$env:TEMPORAL_ADDRESS='localhost:7233'; npm run worker` (workers read `.env` process vars; load env manually). In `.env.local`, set `TEMPORAL_ENABLED=true`, restart Next. The worker reads `.env.local` through dotenv; restart it if you change credentials.

## Real bounded probe
`npm run probe > probe-output.json` (run on user's own laptop with permission and good Internet). Import the output JSON via the dashboard. It performs 7 baseline HTTPS GETs and a bounded concurrent download probe of 2×3 MB, plus 8 loaded timing samples; it is only a coarse HTTPS timing demonstration, not a valid official bufferbloat grade.

## Hosting decision
For today: local Next + Temporal + Worker demo, screen share or tunnel if available. Static Vercel deployment of frontend alone will NOT make a local Temporal Worker reachable or expose local ping capabilities. Post-hackathon: use a persistent Worker/Temporal server + authenticated agent and HTTPS backend before claiming hosted end-to-end availability.
