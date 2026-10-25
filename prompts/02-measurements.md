# W2 — Network Measurement Engineer

Read `AGENTS.md`, `docs/CONTRACTS.md`, `docs/TASKS.md`.
You own `src/lib/scoring.ts`, `src/lib/sample.ts`, `scripts/probe.mjs`, `tests/scoring.test.ts`, measurement docs. Never modify UI, Temporal, AI or frozen contract.

GOAL: defensible real measurements, reproducible demo and accurate terminology.
1. Confirm sample arithmetic, severity cutoffs, invalid input behavior; add boundary tests.
2. Review bounded HTTPS probe: fetch timeout, error handling, finite numeric fields, target fixed or allowlisted, no arbitrary third-party scanning, no secrets and no excessive traffic. Test with user's consent.
3. Ensure `source`, notes and caveats are accurate: HTTPS request timing (DNS/TLS/server components) is NOT ICMP latency or formal capacity-saturating bufferbloat test. Do not mislabel.
4. Add a second realistic **synthetic** fixture contrasting healthy vs loaded latency if time allows, with obvious label.
5. Consider jitter stability, sampling distribution, repeat count; don't claim diagnostic proof of bufferbloat based on one test.

Acceptance: `npm run test` passes; valid imported JSON; clear provenance; safe capped traffic. Create `feat/measurements-*` branch, commit and PR. Return verification commands and summary.
