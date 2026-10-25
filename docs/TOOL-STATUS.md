# Current integration status — 2026-10-25

Core local demonstration PASS. Shared setup gate is closed: Roojool's checks and PR3MM's independent sanitized report were accepted. PR3MM's report and follow-up are recorded in [PR #4](https://github.com/Roojool/LatencyLens/pull/4#issuecomment-6396984749); his earlier gh authentication blocker is resolved.

| Check | Integration laptop evidence | PR3MM report |
|---|---|---|
| GitHub | Protected main; required green `checks`, strict updates, admin enforcement; PRs #4/#5/#6/#7 merged without bypass | Push permission PASS; gh authenticated |
| Local checks | 24 tests pass; typecheck and production build pass | Clean install; 18 tests/typecheck/build pass before integration |
| Jarvislabs | Real validated diagnostic output, `aiUsed=true`, exact model `gemma-4-31b-it`; deterministic values unchanged | Configuration and bounded live completion smoke PASS; model ID withheld in his report |
| Temporal | Genuine combined model workflow completed, matching returned ID and completed Activity/history | Not required on his laptop |
| Browser | Sample/import → API → score → Gemma → Temporal → UI PASS; desktop 1440×900 and mobile 390×844, no overflow or console errors | Independent heuristic HTTP smoke PASS; browser unavailable on his session |
| Kepler | Process/sidecar running; actual GUI agent/log inspection BLOCKED by unavailable native Computer Use pipe after retry/reset | Claude Code coding-agent smoke PASS; Kepler not required |

## Real execution evidence

- Strict API smoke: `latencylens-9a599bdf-195e-4b8b-b939-8de06e30ab68`, 11 actual history events including completed Activity and Workflow, validated Gemma report, score `4`, delta `183.5`, no warning.
- Browser-imported synthetic fixture: `latencylens-e78fdd93-7aec-4358-b59f-53fc2ff67c3e`, validated model report and completed Temporal execution shown in the UI.
- Actual unreachable-service fallback: 3.031 seconds. Actual no-worker fallback: 40.111 seconds. Both return direct-fallback, null workflow ID, rule-based output and preserved Temporal/AI warnings.
- Body size/read limits, generic errors, privacy sentinel capture, arithmetic invariance and workflow-ID truth are tested.
- No live network readings are claimed: these demonstrations use explicitly synthetic data. No probe or disruptive worker-outage demonstration was run.

## Remaining work and limits

- Kepler inspection is unverified; direct process/history checks are not Kepler evidence. Record the native bridge blocker when presenting the demo.
- Four dependency audit findings remain (3 high, 1 moderate). No forced major Next/Zod migration; coordinate before public deployment.
- PR3MM owns separate safe-probe hardening and fixture work. The old probe must not be used as a trusted allowlisted collector yet.
- Comparisons, history, auth, databases, deployment and major migrations remain deferred.
- Temporal dev history is in memory. Keep the current service running for the demo.

See [SPRINT-EVIDENCE.md](SPRINT-EVIDENCE.md) for exact startup, redacted artifacts and the three-minute script. Contracts are unchanged; private environment files were not edited or committed.
