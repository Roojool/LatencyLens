import OpenAI from 'openai';
import { z } from 'zod';
import type { Diagnosis, NetworkMeasurement } from './contracts';
import { scoreMeasurement } from './scoring';

const aiSchema = z.object({
  headline: z.string().min(3).max(180),
  explanation: z.string().min(10).max(1200),
  recommendations: z.array(z.string().min(5).max(250)).min(1).max(5),
  evidence: z.array(z.string().max(200)).max(5),
  limitations: z.array(z.string().max(250)).max(5),
});
export async function analyzeWithGemma(measurement: NetworkMeasurement): Promise<Diagnosis> {
  const base = scoreMeasurement(measurement);
  const key = process.env.JARVISLABS_API_KEY;
  const model = process.env.JARVISLABS_MODEL;
  if (!key || !model) return base;
  const client = new OpenAI({apiKey:key,baseURL:process.env.JARVISLABS_BASE_URL ?? 'https://models.jarvislabs.net/v1',timeout:17000,maxRetries:0});
  const response = await client.chat.completions.create({
    model, temperature:0.1, max_tokens:600,
    messages:[
      {role:'system',content:`You are a cautious network performance diagnostician. Return ONLY a JSON object with keys headline, explanation, recommendations, evidence, limitations. Never alter the deterministic severity, delta, ratio or score. Do not claim root cause is proven from latency alone. Distinguish measured fact from hypothesis. Provide read-only suggestions and verification steps. No commands that change routing/firewall/network configuration. Maximum 3 recommendations.`},
      {role:'user',content:JSON.stringify({measurement:{source:measurement.source,target:measurement.target,notes:measurement.notes,packetLossPct:measurement.packetLossPct,downloadMbps:measurement.downloadMbps,uploadMbps:measurement.uploadMbps},computed:{severity:base.severity,score:base.score,deltaMs:base.deltaMs,ratio:base.ratio,evidence:base.evidence},limitations:base.limitations})}
    ]
  });
  const raw = response.choices[0]?.message?.content ?? '';
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  const parsed = aiSchema.parse(JSON.parse(cleaned));
  return {...base,headline:parsed.headline,explanation:parsed.explanation,
    recommendations:parsed.recommendations,evidence:[...base.evidence,...parsed.evidence].slice(0,8),
    limitations:[...base.limitations,...parsed.limitations].slice(0,8),aiUsed:true,model};
}
