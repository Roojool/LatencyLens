import OpenAI from 'openai';
import { z } from 'zod';
import type { Diagnosis, NetworkMeasurement } from './contracts';
import { scoreMeasurement } from './scoring';

const AI_TIMEOUT_MS = 17000;
/**
 * Gemma spends completion tokens on internal reasoning before emitting visible
 * content (see docs/TOOL-STATUS.md: a 32-token smoke returned empty, 256 worked
 * and used 46). The previous 600-token ceiling was shared between reasoning and
 * a full diagnostic object, so output was cut mid-string and `JSON.parse` threw
 * SyntaxError. Bounded, but large enough for reasoning plus the whole object.
 */
const AI_MAX_TOKENS = 1600;

const SYSTEM_PROMPT = `You are a cautious network performance diagnostician. Return ONLY a raw JSON object with keys headline, explanation, recommendations, evidence, limitations. Do not wrap it in markdown code fences and do not add any prose before or after it. Never alter the deterministic severity, delta, ratio or score. Do not claim root cause is proven from latency alone. Distinguish measured fact from hypothesis. Provide read-only suggestions and verification steps. No commands that change routing/firewall/network configuration. Maximum 3 recommendations.`;

const aiSchema = z.object({
  headline: z.string().min(3).max(180),
  explanation: z.string().min(10).max(1200),
  recommendations: z.array(z.string().min(5).max(250)).min(1).max(5),
  evidence: z.array(z.string().max(200)).max(5),
  limitations: z.array(z.string().max(250)).max(5),
});

export type GemmaCompletion = { content: string | null; finishReason: string | null };
export type GemmaCompleter = (input: {
  apiKey: string; model: string; system: string; user: string;
}) => Promise<GemmaCompletion>;

/**
 * Extracts the first complete JSON object from model text. Tolerates markdown
 * fences and surrounding prose. Returns null when there is no object or the
 * object never closes, which is how truncated output is detected.
 */
export function extractJsonObject(text: string): string | null {
  if (!text) return null;
  let body = text.trim();
  const fence = body.indexOf('```');
  if (fence !== -1) {
    body = body.slice(fence + 3).replace(/^[a-zA-Z]*[ \t]*\r?\n?/, '');
    const close = body.indexOf('```');
    if (close !== -1) body = body.slice(0, close);
  }
  const start = body.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { if (inString) escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return body.slice(start, i + 1); }
  }
  return null;
}

/**
 * Merges a validated model narrative onto the deterministic result. Returns
 * `base` unchanged when output is empty, truncated, unparseable or fails
 * validation, so callers never see a thrown parse error. severity/score/
 * deltaMs/ratio always come from the rule engine, never from the model.
 */
export function applyAiNarrative(
  base: Diagnosis,
  raw: string | null | undefined,
  finishReason: string | null | undefined,
  model: string,
): Diagnosis {
  // Accept a narrative only from a completion that actually finished. Truncation
  // ('length'), provider filtering ('content_filter'), tool stops and absent or
  // unknown reasons all degrade to the deterministic result instead.
  if (finishReason !== 'stop') return base;
  const json = extractJsonObject(raw ?? '');
  if (!json) return base;
  let candidate: unknown;
  try { candidate = JSON.parse(json); } catch { return base; }
  const parsed = aiSchema.safeParse(candidate);
  if (!parsed.success) return base;
  const ai = parsed.data;
  return {
    severity: base.severity, score: base.score, deltaMs: base.deltaMs, ratio: base.ratio,
    headline: ai.headline,
    explanation: ai.explanation,
    recommendations: ai.recommendations,
    evidence: [...base.evidence, ...ai.evidence].slice(0, 8),
    limitations: [...base.limitations, ...ai.limitations].slice(0, 8),
    aiUsed: true, model,
  };
}

/**
 * Only enumerated or numeric measurement fields reach the provider. `target` and
 * `notes` are free-form strings that an imported measurement can fill with private
 * hostnames, IP addresses or credentials, so they are never sent. Provenance still
 * travels through the `source` enum and the deterministic `limitations`.
 */
function buildUserPayload(measurement: NetworkMeasurement, base: Diagnosis): string {
  return JSON.stringify({
    measurement: {
      source: measurement.source,
      packetLossPct: measurement.packetLossPct,
      downloadMbps: measurement.downloadMbps, uploadMbps: measurement.uploadMbps,
    },
    computed: {
      severity: base.severity, score: base.score, deltaMs: base.deltaMs,
      ratio: base.ratio, evidence: base.evidence,
    },
    limitations: base.limitations,
  });
}

const defaultCompleter: GemmaCompleter = async ({ apiKey, model, system, user }) => {
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.JARVISLABS_BASE_URL ?? 'https://models.jarvislabs.net/v1',
    timeout: AI_TIMEOUT_MS, maxRetries: 0,
  });
  const response = await client.chat.completions.create({
    model, temperature: 0.1, max_tokens: AI_MAX_TOKENS,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  const choice = response.choices[0];
  return { content: choice?.message?.content ?? '', finishReason: choice?.finish_reason ?? null };
};

/**
 * Server-side Gemma adapter. Never throws and never changes deterministic
 * arithmetic: any configuration, transport, truncation or validation problem
 * degrades to the rule-based result with `aiUsed=false`.
 * `completer` is injected by tests only; callers keep the single-argument form.
 */
export async function analyzeWithGemma(
  measurement: NetworkMeasurement,
  completer: GemmaCompleter = defaultCompleter,
): Promise<Diagnosis> {
  const base = scoreMeasurement(measurement);
  const apiKey = process.env.JARVISLABS_API_KEY?.trim();
  const model = process.env.JARVISLABS_MODEL?.trim();
  if (!apiKey || !model) return base;
  try {
    const { content, finishReason } = await completer({
      apiKey, model, system: SYSTEM_PROMPT, user: buildUserPayload(measurement, base),
    });
    return applyAiNarrative(base, content, finishReason, model);
  } catch {
    // Provider/transport failure. Raw provider errors can carry credentials or
    // endpoint details, so nothing from the error is logged or returned.
    return base;
  }
}
