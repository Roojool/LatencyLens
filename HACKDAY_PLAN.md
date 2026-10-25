# LatencyLens — two-engineer implementation plan

This replaces all previous four-developer plans. Roojool leads; PR3MM contributes measurement/Gemma. Tanvi and Manish own presentation/video, coordinated separately by Roojool.

## Gate 0: verify both setups
Complete [docs/SETUP.md](docs/SETUP.md) independently: GitHub write access, working agent, clean dependencies/checks, heuristic API report, and real Jarvislabs model access. Roojool additionally verifies Temporal/Kepler. No feature implementation before both engineers' sanitized reports pass. Missing credentials/credits remain explicit blockers; keep the honest heuristic starter available.

## Gate 1: smallest working E2E
| Roojool | PR3MM |
|---|---|
| All dashboard/UI and shadcn dependencies/config | Scoring correctness and healthy/loaded synthetic fixtures |
| Bounded Temporal workflow, Worker and API integration | Safe bounded/allowlisted local HTTPS probe |
| CI/PR integration and complete demonstration | Server-side Gemma adapter, validation/fallback, focused tests |

Respect [exclusive paths](docs/ROLE-MAP.md) and frozen [contracts](docs/CONTRACTS.md). Agree on exports first. Parent lead may use optional configured Luna workers with isolated worktrees for simultaneous writes.

First integrated path: synthetic/imported measurement → validated API → deterministic score → real Gemma explanation or visible fallback → actual Temporal ID or honest direct status. Preserve all teammate work.

## Gate 2: integrate and demonstrate
Use `feat/lead-*` and `feat/measurements-ai-*`, small PRs, tests/typecheck/build, required green `checks` and manual shared-config review. Roojool verifies complete flow after each merge. No main push, force push or bypass.

Follow [shadcn dashboard direction](docs/UI-DESIGN.md); preserve import, diagnosis, responsive layout and provenance. Include screenshot or exact reproduction for UI PRs.

A three-minute product demonstration should show labeled synthetic data, a real local measurement only if available, diagnosis grounded in deterministic evidence, and genuine model/workflow evidence. Kepler recovery follows a healthy run and operator approval. Tanvi/Manish coordinate the presentation/video directly with Roojool.

## Only after stable P0
Before/after comparison, export, and operational recovery polish. Defer native clients, accounts/auth, databases, advanced sensors and cloud hosting. HTTPS estimates are not ICMP or certified bufferbloat. Stop optional work when integration becomes fragile; never simulate missing sponsor integrations.