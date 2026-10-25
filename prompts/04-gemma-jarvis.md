# W4 — Manish: short Jarvislabs / Gemma smoke verification (5% engineering)

Read `AGENTS.md`, `docs/ROLE-MAP.md`, `docs/CONTRACTS.md`. Your task is deliberately SMALL so your coding subscription lasts.

Do NOT edit `src/lib/ai.ts`, `src/temporal/**`, `src/app/**`, scoring or shared dependencies. PR3MM owns the main Gemma integration; Roojool owns app integration.

1. Open your own Jarvislabs account and verify the actual Token Factory base URL, available Gemma 4 model ID and whether sponsored credits work.
2. In your **local ignored environment only**, run 1–2 small prompts in the playground/API: one JSON diagnostic response and one malformed-output scenario if feasible. Never print, share, screenshot or commit the API key or full headers.
3. Write `docs/JARVISLABS-SMOKE.md`: exact model identifier (not secret), provider base URL, whether JSON-only prompts work, latency roughly, output restrictions and any failures. **No fabricated results.**
4. Optionally write `tests/jarvis-smoke.test.ts` with **mocked** provider output and safe fixtures, only if tests need coverage and PR3MM approves interface expectations.
5. Message PR3MM the sanitized findings, not your key. Open `feat/jarvis-smoke` PR and stop.

If you lack working credits, report it and exit; the app must continue through its rule-based fallback.
