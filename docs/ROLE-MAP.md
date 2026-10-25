# Active ownership — two engineers

Roojool is project lead and primary engineer. PR3MM is the second engineer.
This replaces every former four-developer assignment, including old branches' prompts.

| Person | Responsibility | Owned paths |
|---|---|---|
| Roojool + lead agent | Dashboard/all UI, shadcn/dependencies, Temporal/API, integration, GitHub/CI, setup, Kepler, demo | `src/app/**`, `src/components/**`, `src/temporal/**`, shared config/dependencies, setup scripts/tests, engineering docs |
| PR3MM + his agent | Measurement/scoring, synthetic scenarios, bounded probe, main Gemma adapter and tests | `src/lib/scoring.ts`, `src/lib/sample.ts`, `src/lib/ai.ts`, `scripts/probe.mjs`, `tests/scoring.test.ts`, new measurement/AI tests |
| Tanvi and Manish | Presentation and video, coordinated directly by Roojool | No application, API verification or engineering deliverables |

`src/lib/contracts.ts` stays frozen without explicit lead agreement. PR3MM proposes dependency/contract changes through the PR handoff; Roojool coordinates them.
Neither engineer edits the other's paths without agreement. Preserve existing branches and uncommitted work.

## Start here
1. Both engineers complete [SETUP.md](SETUP.md); record only sanitized status, never keys.
2. Roojool uses `prompts/00-CODEX-TAKEOVER.md`; PR3MM uses `prompts/02-measurements.md`.
3. After BOTH setup reports pass, implement concurrently on the non-overlapping paths above. Missing service access blocks its live claim.
4. Use `feat/lead-*` and `feat/measurements-ai-*` branches, small PRs and required green `checks`. Shared config/dependencies/contracts require manual inspection.

Roojool may use the configured Temporal/shadcn workers and read-only reviewer. Isolate concurrent writes with worktrees; PR3MM does not need subagents.