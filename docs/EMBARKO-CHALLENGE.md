# LatencyLens · The Internet Congestion Lab

The live check sends six small same-origin HTTPS requests and records the median, spread, and failed checks. Try one change while investigating a slowdown and retest beside the first run. The checks include browser, network and server time, so they cannot confirm the root cause. The app suggests a next step locally and can copy the timing summary to an AI assistant you choose.

A standalone educational edition about why fast internet can still feel slow. The lab uses React, TypeScript and Vite. Its entire experiment runs in the browser. Start with the load slider or the healthy and congested presets, compare activities at the same load, then download the current result as a PNG.

## Repository audit

| Area | Evidence and publication decision |
| --- | --- |
| Research application | Main started clean at `59ee549`. Next.js 15, React 19, TypeScript, JSON import, deterministic scoring, Gemma validation, and a direct fallback are in the original application. |
| Local demo | [PR #12](https://github.com/Roojool/LatencyLens/pull/12) merged the Docker Compose demo. Its required check passed at merge. The current baseline was rerun separately. |
| Team branches | [PR #8](https://github.com/Roojool/LatencyLens/pull/8) contains draft probe/fixture hardening. [PR #10](https://github.com/Roojool/LatencyLens/pull/10) contains draft comparison work. Both remain with their owners. |
| Setup | The earlier two-engineer gate was closed with independent reports in [tool status](TOOL-STATUS.md). This run rechecked the lead workstation's configuration without provider calls. |
| Reuse | The MIT [license](../LICENSE), research link and contributor history travel with the work. The lab uses newly authored UI, queue model, examples, tests, explanation copy and canvas export. It imports no original scoring, fixtures, probe, AI or Temporal code. |
| Open items | Original probe hardening, public hosting for the research application and its dependency advisories are separate work. Resolve contest eligibility with the organizers before entry. |

## Model and boundaries

Let `L` be the rounded percentage load in the interval 0–100. The illustrative queue wait is `round(L² / 50)` milliseconds. Loaded latency is the idle baseline plus that wait, capped at 250 ms to fit the chart. The reported added delay is loaded minus idle. Baselines are illustrative example paths from 15 to 60 ms. An activity's baseline does not imply a typical internet-wide latency for that activity.

The indicator bands use added delay in milliseconds. Zero means no added delay, 1–24 means short queue, 25–99 means queue building, and 100 or more means long queue. These are educational labels. The tracks share an absolute round-trip scale. The packet animation stretches time for visibility. Comparison keeps load constant and changes the illustrative path. The model provides no throughput, loss, ISP attribution or measurements of the visitor's connection.

Use Node 22.18 or later. From `apps/embarko-challenge`, run `npm ci`, `npm test`, `npm run build`, and `npm run preview`. See [QA](EMBARKO-QA.md), [deployment](EMBARKO-DEPLOYMENT.md), and [eligibility](EMBARKO-ELIGIBILITY.md).
