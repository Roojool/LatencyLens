import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('');
});

function exportStatus(page: Page) {
  return page.getByRole('region', { name: 'Compare and share' }).getByRole('status');
}

async function downloadPng(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download summary PNG' }).click(),
  ]);
  return download;
}

async function tabTo(page: Page, control: Locator) {
  for (let count = 0; count < 20; count++) {
    if (await control.evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(control).toBeFocused();
}

for (const [width, height] of [[360, 800], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
  test.describe(width + 'px viewport', () => {
    test.use({ viewport: { width, height } });

    test('fits the experiment and an open comparison', async ({ page }) => {
      const start = page.getByRole('link', { name: 'Try the congestion experiment' });
      await expect(start).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole('heading', { name: 'Response time' })).toBeInViewport();
      const activity = await page.getByRole('group', { name: 'Activity' }).boundingBox();
      const response = await page.getByRole('heading', { name: 'Response time' }).boundingBox();
      if (width < 720) {
        expect(response!.y + response!.height).toBeLessThanOrEqual(activity!.y);
      } else {
        expect(activity!.x + activity!.width).toBeLessThanOrEqual(response!.x);
      }

      await start.click();
      await expect(page).toHaveURL(/#experiment$/);
      await page.getByRole('button', { name: 'Congested' }).click();
      await page.getByRole('combobox', { name: 'Compare with' }).selectOption({ label: 'Downloading' });
      await expect(page.getByRole('article')).toHaveCount(2);
      const clipped = await page.locator('main button, main input, main select, article').evaluateAll(controls =>
        controls.filter(el => {
          const { left, right } = el.getBoundingClientRect();
          return left < 0 || right > document.documentElement.clientWidth;
        }).map(el => el.id || el.textContent),
      );
      expect(clipped).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  });
}

test('operates the experiment and disclosure using only the keyboard', async ({ page }) => {
  const start = page.getByRole('link', { name: 'Try the congestion experiment' });
  await tabTo(page, start);
  await expect(start).not.toHaveCSS('outline-style', 'none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#experiment$/);

  const game = page.getByRole('button', { name: 'Gaming' });
  await tabTo(page, game);
  await page.keyboard.press('Space');
  await expect(game).toHaveAttribute('aria-pressed', 'true');
  const load = page.getByRole('slider', { name: 'Simulated network load' });
  await tabTo(page, load);
  await page.keyboard.press('ArrowRight');
  await expect(load).toHaveValue('36');
  await page.keyboard.press('Home');
  await expect(page.getByText('No added delay', { exact: true })).toBeVisible();
  await tabTo(page, page.getByRole('button', { name: 'Healthy' }));
  await page.keyboard.press('Enter');
  await expect(load).toHaveValue('10');

  const compare = page.getByRole('combobox', { name: 'Compare with' });
  await tabTo(page, compare);
  await page.keyboard.press('End');
  await expect(page.getByRole('heading', { level: 3, name: 'Downloading' })).toBeVisible();
  await tabTo(page, page.getByRole('button', { name: 'Download summary PNG' }));
  const pending = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  expect(await (await pending).failure()).toBeNull();
  await tabTo(page, page.getByText('How this simulation works', { exact: true }));
  await page.keyboard.press('Space');
  await expect(page.getByText(/all times are simulated/)).toBeVisible();
});

test('compares at the same load and swaps the activities when the reference is selected', async ({ page }) => {
  const compare = page.getByRole('combobox', { name: 'Compare with' });
  const cards = page.getByRole('article');
  await compare.selectOption({ label: 'Downloading' });
  await expect(cards.locator('p')).toHaveText(['30 ms idle · 55 ms loaded', '60 ms idle · 85 ms loaded']);
  await page.getByRole('slider').press('End');
  await expect(cards.locator('strong')).toHaveText(['+200 ms', '+190 ms']);
  await page.getByRole('button', { name: 'Downloading' }).click();
  await expect(compare).toHaveValue('video-call');
  await expect(cards.getByRole('heading')).toHaveText(['Downloading', 'Video call']);
  await expect(cards.locator('p')).toHaveText(['60 ms idle · 250 ms loaded', '30 ms idle · 230 ms loaded']);
  await compare.selectOption('');
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole('slider')).toHaveValue('100');
});

test('Reset restores the default activity, load, results and share panel', async ({ page }) => {
  await page.getByRole('button', { name: 'Gaming' }).click();
  const congested = page.getByRole('button', { name: 'Congested' });
  await congested.click();
  await expect(congested).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('slider')).toHaveValue('95');
  const compare = page.getByRole('combobox', { name: 'Compare with' });
  await compare.selectOption({ label: 'Browsing' });
  await downloadPng(page);
  await expect(exportStatus(page)).toHaveText(/PNG ready/);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('group', { name: 'Activity' }).getByRole('button', { pressed: true })).toHaveText(/Video call/);
  await expect(congested).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('slider')).toHaveValue('35');
  await expect(page.getByRole('region', { name: 'Video call' })).toContainText('At 35% load, each simulated round trip takes 25 ms longer');
  await expect(page.getByText('Queue building', { exact: true })).toBeVisible();
  await expect(compare).toHaveValue('');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(exportStatus(page)).toBeEmpty();
});

for (const comparison of [false, true]) {
  const mode = comparison ? 'comparison' : 'single activity';
  test('downloads a readable PNG with the expected ' + mode + ' values', { tag: '@smoke' }, async ({ page }, testInfo) => {
    if (comparison) {
      await page.getByRole('button', { name: 'Gaming' }).click();
      await page.getByRole('slider').press('End');
      await page.getByRole('combobox', { name: 'Compare with' }).selectOption({ label: 'Downloading' });
    }
    const drawn = await page.evaluateHandle(() => {
      const lines: string[] = [];
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        fillText.apply(this, args);
        lines.push(args[0].trim().replace(/\s+/g, ' '));
      };
      return lines;
    });

    const download = await downloadPng(page);
    expect(download.suggestedFilename()).toBe('latencylens-simulation.png');
    const bytes = await readFile(await download.path());
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    const dimensions = await page.evaluate(async data => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + data;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }, bytes.toString('base64'));
    expect(dimensions).toEqual([1080, comparison ? 850 : 630]);
    await testInfo.attach('summary.png', { body: bytes, contentType: 'image/png' });

    const rows = comparison ? [
      'Network load: 100%',
      'Gaming', 'Idle 15 ms · Loaded 215 ms', '+200 ms added · Long queue',
      'Downloading', 'Idle 60 ms · Loaded 250 ms', '+190 ms added · Long queue',
    ] : [
      'Network load: 35%',
      'Video call', 'Idle 30 ms · Loaded 55 ms', '+25 ms added · Queue building',
    ];
    expect(await drawn.jsonValue()).toEqual([
      'LATENCYLENS / SIMULATION', 'The Internet Congestion Lab', ...rows,
      'Illustrative round-trip times only. No connection was measured.',
    ]);
    await expect(exportStatus(page)).toHaveText(/PNG ready/);
  });
}

test('announces an encoding failure and allows a successful retry', async ({ page }) => {
  await page.evaluate(() => {
    const toBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      HTMLCanvasElement.prototype.toBlob = toBlob;
      callback(null);
    };
  });
  const save = page.getByRole('button', { name: 'Download summary PNG' });
  await save.click();
  await expect(exportStatus(page)).toHaveText('The PNG export failed. Please try again.');
  await expect(save).toBeEnabled();
  const retry = await downloadPng(page);
  expect(await retry.failure()).toBeNull();
  await expect(exportStatus(page)).toHaveText(/PNG ready/);
});

test('reduced motion stops both packets and bar transitions while results still update', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const packets = page.locator('.track b');
  const bars = page.locator('.track i');
  await expect(packets).toHaveCount(2);
  await expect(packets.first()).not.toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const packet of await packets.all()) await expect(packet).toHaveCSS('animation-name', 'none');
  for (const bar of await bars.all()) await expect(bar).toHaveCSS('transition-duration', '0s');
  await page.getByRole('button', { name: 'Congested' }).click();
  await expect(page.getByRole('region', { name: 'Video call' })).toContainText('At 95% load, each simulated round trip takes 181 ms longer');
});

test('axe checks the default page and the expanded mobile comparison', async ({ page }) => {
  async function checkAccessibility() {
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map(v => ({ rule: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await checkAccessibility();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('combobox', { name: 'Compare with' }).selectOption({ label: 'Downloading' });
  await page.getByText('How this simulation works', { exact: true }).click();
  await expect(page.getByText(/all times are simulated/)).toBeVisible();
  await checkAccessibility();
});
