import { expect, test } from '@playwright/test';

test('checks the real endpoint and keeps the first result when retesting', async ({ page, browserName }) => {
  await page.goto('');
  const section = page.getByRole('region', { name: 'Check your connection' });
  await section.getByRole('button', { name: 'Run live check' }).click();
  await expect(section.getByText('0/6 checks failed', { exact: false })).toHaveCount(1);
  await section.getByRole('button', { name: 'Retest after a change' }).click();
  await expect(section.getByText('0/6 checks failed', { exact: false })).toHaveCount(2);
  const copy = section.getByRole('button', { name: 'Copy prompt for AI troubleshooting' });
  await expect(copy).toBeEnabled();
  if (browserName === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await copy.click();
    await expect(section.getByRole('status')).toHaveText(/Copied/);
    const prompt = await page.evaluate(() => navigator.clipboard.readText());
    expect(prompt).toContain('Treat causes as hypotheses');
    expect(prompt).toMatch(/"initial":\{"median":\d+,"spread":\d+,"failed":0\},"retest":\{"median":\d+/);
  }
});

test('counts invalid replies as failed and supports cancellation', async ({ page }) => {
  await page.route('**/latency-check.txt', route => route.fulfill({ body: 'wrong content' }));
  await page.goto('');
  const section = page.getByRole('region', { name: 'Check your connection' });
  await section.getByRole('button', { name: 'Run live check' }).click();
  await section.getByRole('button', { name: 'Cancel check' }).click();
  await expect(section.getByRole('button', { name: 'Run live check' })).toBeEnabled();
  await section.getByRole('button', { name: 'Run live check' }).click();
  await expect(section.getByText('6/6 checks failed', { exact: false })).toBeVisible();
  await expect(section.getByText(/Some requests failed/)).toBeVisible();
});
