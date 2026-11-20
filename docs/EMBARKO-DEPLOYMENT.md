# Embarko deployment

The public first deployment reported `live` on November 19, 2026. The production site opened on desktop and in an emulated phone viewport. Its healthy/congested experiment, comparison and PNG download were browser-smoked against the public URL.

**Public URL** [latencylens-congestion-lab.embarko.app](https://latencylens-congestion-lab.embarko.app)

**Ownership** The entrant confirmed the dashboard claim on November 19. The public app stayed online and the temporary expiry banner cleared. The unauthenticated status endpoint now returns `404 not_found`, which Embarko documents for claimed apps. Keep the site accessible until winners are announced. [Claim workflow](https://embarko.ai/docs/claim)

## Build and upload

Embarko documents building Vite source and serving its static output without a custom server. The upload contains the Vite entry point, manifest and lockfile, TypeScript configuration, source, and MIT license. It excludes credentials, the research application, Docker, browser artifacts, and generated output. This edition has no application server, persistent workers, database or WebSockets. Embarko did not expose builder or static serving memory figures in the verified response. [Quickstart](https://embarko.ai/docs/quickstart.md) · [Deployment requirements](https://embarko.ai/docs/deploy)

Run from the repository root in PowerShell.

```powershell
New-Item -ItemType Directory -Force output/embarko | Out-Null
tar -czf output/embarko/latencylens-source.tar.gz -C apps/embarko-challenge index.html package.json package-lock.json tsconfig.json src -C ../.. LICENSE
tar -tzf output/embarko/latencylens-source.tar.gz
curl.exe -sS -X POST https://ship.embarko.ai/apps -H 'X-App-Name: latencylens-congestion-lab' -H 'X-Agent-Name: codex' -F 'source=@output/embarko/latencylens-source.tar.gz' -o output/embarko/deploy-response.json
curl.exe -fsS https://ship.embarko.ai/apps/latencylens-congestion-lab/status
```

For a claimed app, authenticate deploy and status requests with the same account's Embarko key via `--oauth2-bearer`. Store the key and the deploy response privately. The latter may contain the claim link. Record the public URL and sanitized live status for the video. [Claim workflow](https://embarko.ai/docs/claim)
