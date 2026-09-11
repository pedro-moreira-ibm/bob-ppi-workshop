import { test, expect } from '@playwright/test';

test('personalized copy and progress survive navigation and reload', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./setup/');
  await page.locator('#participant-number').selectOption('3');
  await expect(page.locator('#environment-label')).toHaveText('FLGHT403 · Port 3003');
  await page.goto('./exercise-3/');
  await expect(page.locator('#participant-number')).toHaveValue('3');
  await expect(page.locator('#environment-label')).toHaveText('FLGHT403 · Port 3003');
  const frame = page.locator('.prompt-frame').first();
  await expect(frame).toContainText('FLGHT403');
  await frame.getByRole('button').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('FLGHT403');
  await page.locator('#stage-complete').check();
  await page.reload();
  await expect(page.locator('#stage-complete')).toBeChecked();
  await page.goto('./setup/');
  await expect(page.locator('#participant-number')).toHaveValue('3');
  await expect(page.locator('#progress-label')).toHaveText('1 of 6 core exercises completed');
  await page.locator('#participant-number').selectOption('50');
  await page.goto('./exercise-3/');
  await expect(page.locator('.prompt-frame').first()).toContainText('FLGHT450');
  await page.goto('./setup/');
  await page.locator('#participant-number').selectOption('');
  await page.goto('./exercise-3/');
  await expect(page.locator('.prompt-frame').first()).toContainText('FLGHT4nn');
  await page.goto('./setup/');
  await page.locator('#participant-number').selectOption('3');
  await page.goto('./exercise-7/');
  await expect(page.locator('.participant-panel')).toBeVisible();
  await expect(page.locator('#participant-number')).toHaveValue('3');
  await expect(page.locator('#progress-label')).toHaveText('1 of 6 core exercises completed');
  await expect(page.locator('.sl-markdown-content')).toContainText('3003:localhost:3003');
  await expect(page.locator('#resume-link')).toHaveText('View Workshop Summary →');
  await expect(page.locator('#resume-link')).toHaveAttribute('href', '/bob-ppi-workshop/summary/');
});

test('current exercise sections expand below its sidebar link and content is centered', async ({ page }) => {
  await page.goto('./exercise-3/');
  const sidebar = page.locator('#starlight__sidebar');
  const sections = sidebar.getByRole('navigation', { name: 'Sections in the current page' });
  await expect(sections.locator('details')).toHaveAttribute('open', '');
  await expect(sidebar.getByRole('link', { name: /3.2. Trace the existing pattern/ })).toBeVisible();
  await expect(sidebar.getByText('On this page', { exact: true })).toHaveCount(0);
  await expect(page.locator('.right-sidebar-container')).toBeHidden();
  const alignment = await page.evaluate(() => {
    const pane = document.querySelector('.main-pane').getBoundingClientRect();
    const container = document.querySelector('main .sl-container').getBoundingClientRect();
    return { left: container.left - pane.left, right: pane.right - container.right };
  });
  expect(Math.abs(alignment.left - alignment.right)).toBeLessThan(2);
  await page.goto('./exercise-4/');
  await expect(sidebar.getByRole('link', { name: /4.2. Explain the performance/ })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: /3.2. Trace the existing pattern/ })).toHaveCount(0);
  await sidebar.getByText('Sections', { exact: true }).click();
  await expect(sidebar.getByRole('link', { name: /4.2. Explain the performance/ })).toBeHidden();
  await page.goto('./exercise-7/');
  await expect(sidebar.getByRole('link', { name: /7.1. Prepare the environment/ })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: /For Windows users/ })).toHaveCount(0);
  await expect(sidebar.getByRole('link', { name: /Expected result/ })).toHaveCount(0);
});

test('overview title is centered and highlighted across the content width', async ({ page }) => {
  await page.goto('./');
  const title = page.getByRole('heading', { level: 1 });
  await expect(title).toHaveText('Modernize IBM i applications with IBM Bob');
  const presentation = await title.evaluate(element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const container = element.parentElement.getBoundingClientRect();
    return {
      alignment: style.textAlign,
      widthDifference: Math.abs(box.width - container.width),
      background: style.backgroundImage,
    };
  });
  expect(presentation.alignment).toBe('center');
  expect(presentation.widthDifference).toBeLessThan(2);
  expect(presentation.background).toContain('linear-gradient');
});

test('illustrative examples are not copyable and documentation links are available', async ({ page }) => {
  for (const slug of ['setup', ...Array.from({ length: 7 }, (_, i) => `exercise-${i + 1}`)]) {
    await page.goto(`./${slug}/`);
    await expect(page.locator('.illustrative-frame').getByRole('button')).toHaveCount(0);
    await expect(page.locator('.prompt-toolbar').filter({ hasText: 'CODE / COMMAND' })).toHaveCount(0);
    const copyableBlocks = page.locator('.prompt-frame:not(.illustrative-frame)');
    if (await copyableBlocks.count()) {
      await expect(copyableBlocks.first().getByRole('button', { name: 'Copy code or prompt' })).toBeVisible();
    }
  }
  await page.goto('./exercise-4/');
  const sqlQuery = page.locator('.prompt-frame').filter({ hasText: 'Flight Booking Summary' }).first();
  await expect(sqlQuery).toContainText('SQL QUERY');
  await expect(sqlQuery).not.toHaveClass(/illustrative-frame/);
  await expect(sqlQuery.getByRole('button', { name: 'Copy code or prompt' })).toBeVisible();
  await page.goto('./exercise-6/');
  const source = page.locator('.prompt-frame').filter({ hasText: 'dcl-proc checkCustomerExists export' }).first();
  await expect(source).toContainText('SOURCE');
  await expect(source).not.toHaveClass(/illustrative-frame/);
  await expect(source.getByRole('button', { name: 'Copy code or prompt' })).toBeVisible();
  await page.goto('./exercise-7/');
  await expect(page.getByRole('link', { name: 'SAMPLE-SKILL.md' })).toHaveAttribute('href', '/bob-ppi-workshop/lab/SAMPLE-SKILL.md');
  await expect(page.getByRole('link', { name: 'Bob IDE', exact: true })).toHaveAttribute('href', 'https://bob.ibm.com/docs/ide');
  await expect(page.getByRole('link', { name: 'Bob Shell', exact: true })).toHaveAttribute('href', 'https://bob.ibm.com/docs/shell');
  await expect(page.getByRole('link', { name: 'IBM i Cheat Sheet', exact: true })).toHaveAttribute('href', '/bob-ppi-workshop/docs/ibmi-premium-package-cheat-sheet.pdf');
});

test('exercise 7 shell commands stay light, readable and copyable', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./exercise-7/');
  await page.locator('#participant-number').selectOption('3');
  const commands = page.locator('.light-command-frame');
  await expect(commands).toHaveCount(3);
  for (const command of await commands.all()) {
    await expect(command.locator('.prompt-toolbar')).toContainText('COMMAND');
    await expect(command.getByRole('button', { name: 'Copy code or prompt' })).toBeVisible();
    expect(await command.locator('code').evaluate(element => getComputedStyle(element).color)).toBe('rgb(16, 24, 32)');
  }
  await commands.first().getByRole('button', { name: 'Copy code or prompt' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('3003:localhost:3003');
});

test('summary celebrates completion without separate resource pages', async ({ page }) => {
  await page.goto('./summary/');
  await expect(page.locator('.summary-celebration')).toBeVisible();
  await expect(page.locator('.summary-celebration')).toContainText('Congratulations!');
  await expect(page.locator('.sl-markdown-content')).toContainText('What you accomplished');
  await expect(page.locator('.sl-markdown-content')).not.toContainText('Next steps:');
  await expect(page.getByRole('link', { name: 'Workshop summary' })).toBeVisible();
  await expect(page.getByText('Resources', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Application reference' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Sample skill' })).toHaveCount(0);
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
  for (const slug of ['', 'setup', ...Array.from({length:7},(_,i)=>`exercise-${i+1}`), 'summary']) {
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
