# Time-boxed sprint board — four developers

| Priority | Owner | Task | Acceptance |
|---|---|---|---|
| P0 | W1 coordinator/UI | Public repo/bootstrap, ownership, UI skeleton | Public GitHub + app runs |
| P0 | W2 probe/metrics | Validate scoring; working limited local HTTPS probe and caveats | Test file import and metrics |
| P0 | W3 Temporal | Local service, worker and API workflow | Real workflow ID and retries |
| P0 | W4 Gemma | Real Jarvislabs Gemma integration, JSON and fallback | `aiUsed=true` only on success |
| P1 | W1 | polish dashboard, error/loading states, source badges | Mobile + demo screenshot |
| P1 | W2 | compare 2 traces, quality interpretation, more fixtures | Reliable reproducible example |
| P1 | W3 | workflow timeline + resilience demo | Workflow visible in Temporal UI |
| P1 | W4 | explanations, safe recommendations, rubric | Model not allowed to invent data |
| P2 | Any after integration | Export report as Markdown/JSON | Clear provenance |
| P2 | Any after integration | Baseline history/localStorage | No backend migration |
| STOP | All | No native .exe, mobile app, accounts, or cloud DB in this 3-hour sprint | Focus |

## Time plan from team start
- 00:00–00:15 coordinator runs bootstrap; everyone clones, tests environment; choose actual venue challenge fit.
- 00:15–00:30 contracts frozen, owners create branches; each validates local setup.
- 00:30–01:25 parallel build, first real PRs; coordinator runs integration.
- 01:25–02:10 merge + system smoke test; enable Temporal and Jarvis only after direct flow works.
- 02:10–02:40 UX polish, one failure scenario, backup recording.
- 02:40–03:00 submit, README, demo rehearsal. Stop new features.

## Coordinator every 15 minutes
Run `gh pr list`, inspect CI / merge failures, tell agents blockers; update local main; verify all four parts still connect.
