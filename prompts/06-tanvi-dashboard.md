# Tanvi — small UI-only shadcn/dashboard assignment

Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/UI-DESIGN.md`, `docs/CONTRACTS.md`.

Reference: https://ui.shadcn.com/examples/dashboard

Your entire deliverable: **three presentational React components** inside `src/components/dashboard/**`, with typed props and responsive behavior:
1. `dashboard-shell.tsx`: shadcn-style sidebar/header/layout; do not wire fake navigation.
2. `metric-cards.tsx`: idle/loaded/added delay/score from props, correct units and missing value `—`.
3. `diagnosis-panels.tsx`: honest Gemma/Temporal statuses, diagnosis and warnings from props.

Roojool/Codex will initialize/install shadcn primitives and dependencies first; confirm imports with lead before coding. Existing app stays intact. No edits to `src/app/**`, `src/lib/**`, `src/temporal/**`, `src/components/ui/**`, `package*.json`, `AGENTS.md` or `.github/**`. Avoid adding dependencies.

In your clone: branch `feat/tanvi-dashboard`. Implement components and only CSS under your dashboard component directory if needed. Run `npm run typecheck`, `npm run build`. Capture screenshot if possible, commit, push PR. Then stop. Keep AI tool spending low.
