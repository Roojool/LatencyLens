# Roojool — primary engineer and integrator

Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/TASKS.md`, `docs/CONTRACTS.md`, `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOY.md`, `docs/UI-DESIGN.md`.

Follow `prompts/00-CODEX-TAKEOVER.md`. First verify YOUR tools/API and collect PR3MM's sanitized setup report. Tanvi/Manish handle presentation/video.

You own `src/app/**`, `src/components/**`, `src/temporal/**`, dependencies/config, CI/GitHub, setup/operational docs and demo. PR3MM owns measurement/scoring/sample/probe/Gemma and its tests. Coordinate shared-file changes explicitly.

After both setups pass, implement bounded Temporal/API orchestration and the full shadcn dashboard in the existing app. Reference: https://ui.shadcn.com/examples/dashboard. Keep import/diagnose, provenance, accessibility and honest statuses. Verify actual workflow/model calls; use visible fallback on failure.

Configured Luna workers are optional tools owned by the lead. Isolate writes; run tests/typecheck/build; include UI reproduction evidence; open `feat/lead-*` PRs and require green `checks` before merging. Never bypass branch protection.