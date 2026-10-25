# Tool verification and first build jobs

Latest verification: 2026-10-25. Status is evidence from the named device, not a claim about both laptops.

| Check | Roojool integration laptop | PR3MM laptop |
|---|---|---|
| GitHub/main | Clean baseline main `89a1260`, matching origin; baseline CI green. Re-sync after the verification PR merges. | Write permission previously confirmed; local branch/hash report pending |
| Jarvislabs/Gemma | Real completion PASS with `gemma-4-31b-it`; configuration and live smoke pass after token-budget correction | User reports env updated; actual live smoke report pending |
| Temporal | CLI 1.9.1; loopback dev service; real synthetic workflow/activity COMPLETED with history evidence | Not required for secondary contributor's local work |
| Kepler | Installed version `0.1.11-beta` confirmed; workspace/sign-in/agent command execution pending | User reports installed; workspace/agent smoke pending |
| Tests/typecheck | Four tests pass; typecheck passes | Independent local results pending |

Production build also passes. Temporal workflow ID: `latencylens-setup-a077408b-c255-4b8f-812f-70a4fd755f8a`. History contained `ActivityTaskCompleted` and `WorkflowExecutionCompleted` (11 events). The temporary worker used process-only blank AI credentials and returned the deterministic synthetic result (`aiUsed=false`, `deltaMs=183.5`); no network measurement was taken. That temporary worker was stopped after verification so it cannot compete with a later configured worker. The local dev service remains available; its history is in-memory and disappears if restarted. This verifies Temporal SDK/worker execution, not the unfinished Next API outage/fallback integration or a combined live-Gemma workflow.

## Findings for implementation
- The original 32-token provider smoke returned no visible content; a 256-token smoke succeeds. The successful response included reasoning and used 46 completion tokens, so the earlier budget likely caused the empty answer. The setup script now uses 256, with bounded timeout and no retries. An empty answer alone does not prove invalid credentials.
- The existing `analyzeWithGemma(sampleMeasurement)` call fails with `SyntaxError` while parsing diagnostic output. This is an application adapter issue despite working provider access. No raw model text or secrets were logged. PR3MM must investigate truncation, code-fence parsing, output constraints and fallback with focused mocks; preserve deterministic arithmetic and the frozen contract.
- Four existing dependency advisories remain tracked in `TASKS.md`; no major upgrades were applied during verification.

## Release jobs after setup gate
Roojool releases implementation only after receiving PR3MM's clean synchronization/check/live-provider report and a working coding-agent session. Kepler on the integration laptop must also execute the harmless workspace smoke in `SETUP.md`. Do not infer readiness from installation or filled env files.

**Lead agent:** follow `prompts/00-CODEX-TAKEOVER.md`. First ship bounded workflow/API execution and clear service/worker fallback, then shadcn dashboard integration. Lead owns all UI/Temporal/API/config. Optional configured workers use isolated ownership/worktrees.

**PR3MM agent:** follow `prompts/02-measurements.md`. First fix the verified diagnostic JSON failure in `src/lib/ai.ts` with provider-response tests (success, truncation/malformed output, provider failure, unchanged score/severity/delta/ratio), then healthy/loaded fixtures and safe bounded probe hardening. No edits to lead-owned UI/API/Temporal/dependencies without coordination.

Both engineers preserve existing work, branch from current main, run tests/typecheck/build, open small PRs and require green protected-main checks. Neither runs load probes during setup. Tanvi/Manish remain presentation/video only.
