# Verification for the Internet Congestion Lab

## Reproduce

From the repository root, run `npm ci`, `npm run test`, `npm run typecheck`, `npm run build`, and `npm audit --omit=dev`. Run `docker compose config --quiet` to validate the original demo configuration.

From `apps/embarko-challenge`, run:

```powershell
npm ci
npm test
npm run build
npm audit --audit-level=moderate
npx playwright install chromium
npx playwright test --project=chromium
```

For manual verification, run `npm run preview -- --host 127.0.0.1 --port 4173`. Open the URL, select Congested at 95% for the video call, and verify 30 ms idle, 211 ms loaded and 181 ms added. Compare with Gaming, verify 15 ms idle and 196 ms loaded, download the PNG, and reset to the default Video call at 35%. The public site follows the same sequence.

## Results on November 19, 2026

- Original project on Node 24.13.0 and npm 11.19.1. Clean install, all 24 tests, typecheck and the Next.js 15.5.28 production build passed. The local production dashboard completed synthetic diagnosis in Chromium at 1440 and 390 px through the direct path. The Compose configuration validated. Docker Desktop's Linux engine was unavailable. Live Gemma and Temporal were outside this run.
- Original package audit reported four advisories, one moderate and three high, in the legacy dependency tree. The automatic fixes it proposed would upgrade major versions of Next and Zod. The publication bundle contains none of that dependency tree. Track remediation on the research application separately.
- Competition edition. All seven deterministic tests passed. Typecheck and Vite production build passed. Full and production-only dependency audits both reported zero vulnerabilities. The JavaScript bundle was 232.77 kB, 73.01 kB gzip.
- Public Embarko smoke. Chrome opened the site on desktop and in iPhone 13 emulation. The Congested preset, Gaming comparison and touch-triggered PNG download worked. Public checks were repeated after the account claim. A physical iPhone and midrange Android hardware remain unverified.

Local preview captures are under `output/playwright/`. The deployed screenshots and export use the `live-latencylens-` prefix.


Both deployed PNG smoke tests passed on retry, covering single-activity and comparison exports. An earlier run timed out twice. The recovered Windows runner could not find the Chrome channel binary, so the local suite could not be repeated there.
