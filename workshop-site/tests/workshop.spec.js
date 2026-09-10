import { test, expect } from '@playwright/test';

test('personalized copy and progress survive navigation and reload', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./exercise-3/');
  await page.locator('#participant-number').selectOption('3');
  await expect(page.locator('#environment-label')).toHaveText('FLGHT403 · Port 3003');
  const frame = page.locator('.prompt-frame').first();
  await expect(frame).toContainText('FLGHT403');
  await frame.getByRole('button').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('FLGHT403');
  await page.locator('#stage-complete').check();
  await page.reload();
  await expect(page.locator('#stage-complete')).toBeChecked();
  await expect(page.locator('#participant-number')).toHaveValue('3');
  await expect(page.locator('#progress-label')).toHaveText('1 of 7 core stages complete');
  await page.locator('#participant-number').selectOption('50');
  await expect(frame).toContainText('FLGHT450');
  await page.locator('#participant-number').selectOption('');
  await expect(frame).toContainText('FLGHT4nn');
  await page.goto('./exercise-7/');
  await page.locator('#participant-number').selectOption('3');
  await expect(page.locator('.sl-markdown-content')).toContainText('3003:localhost:3003');
});

test('screenshots enlarge and close with Escape', async ({ page }) => {
  await page.goto('./setup/');
  await page.locator('.screenshot-button').first().click();
  await expect(page.locator('#image-viewer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
});

test('all page links and screenshots resolve', async ({ page, request }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  const urls = new Set();
  for (const slug of ['', 'setup', ...Array.from({length:7},(_,i)=>`exercise-${i+1}`), 'summary', 'reference', 'sample-skill']) {
    await page.goto(`./${slug}/`);
    const links = await page.locator('a[href], img[src]').evaluateAll(elements => elements.map(el => el.href || el.src));
    for (const link of links) if (link.startsWith(new URL(page.url()).origin + '/')) urls.add(link.split('#')[0]);
  }
  for (const url of urls) { const response = await request.get(url); if (!response.ok()) failures.push(`${response.status()} ${url}`); }
  expect(failures).toEqual([]);
});

test('mobile pages fit the viewport', async ({ page }) => {
  await page.setViewportSize({width:390, height:844});
  for (const slug of ['', 'exercise-3', 'exercise-7']) {
    await page.goto(`./${slug}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test('production search finds exercise content', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.locator('.pagefind-ui__search-input').fill('RPGUnit');
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
});
