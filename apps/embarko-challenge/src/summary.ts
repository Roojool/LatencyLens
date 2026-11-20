import type { simulate } from './simulation';

type Result = ReturnType<typeof simulate>;

export function summaryRows(result: Result) {
  return [
    result.scenario.label,
    `Idle ${result.baseline} ms   ·   Loaded ${result.loaded} ms`,
    `+${result.added} ms added   ·   ${result.indicator}`,
  ];
}

export async function downloadSummary(result: Result, comparison?: Result) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = comparison ? 850 : 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');

  ctx.fillStyle = '#101916';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#c4fb89';
  ctx.font = 'bold 24px system-ui';
  ctx.fillText('LATENCYLENS   /   SIMULATION', 60, 74);
  ctx.fillStyle = '#eff3e7';
  ctx.font = '54px Georgia';
  ctx.fillText('The Internet Congestion Lab', 60, 151);
  ctx.font = '27px system-ui';
  ctx.fillText(`Network load: ${result.load}%`, 60, 210);

  for (const [index, item] of (comparison ? [result, comparison] : [result]).entries()) {
    const top = 256 + index * 220;
    const [title, times, verdict] = summaryRows(item);
    ctx.fillStyle = '#20332a';
    ctx.fillRect(60, top, 960, 190);
    ctx.fillStyle = '#eff3e7';
    ctx.font = 'bold 36px system-ui';
    ctx.fillText(title, 90, top + 52);
    ctx.font = '29px system-ui';
    ctx.fillText(times, 90, top + 101);
    ctx.fillStyle = '#c4fb89';
    ctx.fillText(verdict, 90, top + 151);
  }

  ctx.fillStyle = '#b1c1b6';
  ctx.font = '24px system-ui';
  ctx.fillText('Illustrative round-trip times only. No connection was measured.', 60, canvas.height - 65);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG encoding failed')), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'latencylens-simulation.png';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
