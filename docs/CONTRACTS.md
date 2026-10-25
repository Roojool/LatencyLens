# Integration contract — freeze at T+20 minutes

`NetworkMeasurement` is defined in `src/lib/contracts.ts`, Zod validates every API input.

`POST /api/diagnose` accepts exactly one `NetworkMeasurement`; returns `DiagnosticResponse` (measurement, diagnosis, workflowMode, workflowId, optional warning).

Sensor limitations:
- `sample` synthetic demo
- `local-https-probe` bounded HTTPS timing (not ICMP)
- `browser-estimate` approximate browser measurements, if built later

UI may safely display missing speed/packet loss as `—`, never `0`.

Diagnostics requirements:
- Rule engine alone determines `deltaMs`, `ratio`, `severity`, `score`.
- LLM may only override natural language keys `headline`, `explanation`, `recommendations`, `evidence`, `limitations`, with validation.
- `aiUsed=true` only after successful real Jarvislabs completion and JSON validation.
- `workflowMode=temporal` only after Temporal workflow actually completes.

No other agent changes this contract without explicit coordinator approval.
