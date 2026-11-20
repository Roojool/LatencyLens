import { expect, test } from '@playwright/test';

test('checks the real endpoint and keeps the first result when retesting', async ({ page }) => {
  await page.goto('');
  const section = page.getByRole('region', { name: 'Check your connection' });
  await section.getByRole('button', { name: 'Run live check' }).click();
  await expect(section.getByText('0/6 checks failed', { exact: false })).toHaveCount(1);
  await section.getByRole('button', { name: 'Retest after a change' }).click();
  await expect(section.getByText('0/6 checks failed', { exact: false })).toHaveCount(2);
  await expect(section.getByRole('button', { name: 'Copy prompt for AI troubleshooting' })).toBeEnabled();
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
