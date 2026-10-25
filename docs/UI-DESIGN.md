# LatencyLens design — shadcn dashboard reference (ACTIVE)

**Exact reference:** https://ui.shadcn.com/examples/dashboard

Build a professional, compact, neutral **shadcn/ui analytics dashboard**. This supersedes the older navy/cyan neon aesthetic. Use the reference as visual inspiration, not an exact app/function copy. Do not recreate the Next.js project.

## Direction
- Default light or clean charcoal theme with subtle neutral surfaces; use semantic tokens, near-invisible borders, restrained shadows, rounded-xl cards, no gradients/glow/glass.
- Desktop: collapsible left sidebar (Overview active, Diagnostics, Compare [coming soon], History [coming soon]); compact header/breadcrumb; title + Import JSON and Run diagnosis actions.
- Metrics: four shadcn Cards: idle latency, loaded latency, added delay, heuristic score. Units and input provenance shown; null `—`.
- Middle: large time-series latency chart with idle/loaded legend and visible synthetic-vs-local provenance. Reuse existing plot logic/data, or use Recharts only if W1 approves dependency.
- Lower: AI diagnosis `Card` (severity, headline, evidence, safe actions) and workflow `Card` (Temporal status, workflow ID, last warning). Avoid fake interactive nav.
- Components: `Card`, `Button`, `Badge`, `Separator`, optional `Tabs`, `Sidebar`, `Skeleton`, `Tooltip` and `lucide-react`. Roojool owns shadcn setup, primitives, composed dashboard components and page integration. Tanvi and Manish handle presentation/video only.
- Type: system/Inter, 13–14px interface text, 28–32px page header, monospace/tabular metrics.
- Accessible contrast and focus; keyboard-operable import/run; responsive at 390px; no dead controls.
- Data: never show synthetic readings as 'live'. Show `workflowMode=temporal` only when returned by backend and `aiUsed=true` only after verified model call.

## Minimal dashboard deliverables — Roojool
`src/components/dashboard/dashboard-shell.tsx` (sidebar/header/layout),
`metric-cards.tsx` (four metric cards from typed props),
`diagnosis-panels.tsx` (diagnosis/workflow/status cards).

Optional `latency-panel.tsx` for chart container if time; preserve and compose the existing `Trace` chart. Roojool owns the page, global styles, API, config and dependencies; PR3MM owns measurements/Gemma.

## Judge screenshot
At 1440×900 show sidebar + summary row + latency chart + root cause. At phone width show stacked cards, chart and action CTA.
