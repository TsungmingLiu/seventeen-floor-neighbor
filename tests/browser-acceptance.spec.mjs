import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173' });

function collectBlockingErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function waitForDialogueReady(page) {
  await expect.poll(async () => {
    const hint = await page.locator('#advance-hint').textContent();
    return /點擊繼續|點擊選擇/.test(hint || '') || await page.locator('#choice-list').isVisible();
  }, { timeout: 5000 }).toBe(true);
}

test('opening-demo saves its real cursor and resumes after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);

  await page.locator('#advance-zone').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('椅子可以留給明天的自己後悔');
  const savedNode = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  );
  expect(savedNode).toBe('common_movein_rain_open_chair');

  await page.locator('#game-home-button').click();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('椅子可以留給明天的自己後悔');
});

test('opening-demo title, Memories, Gallery, and game controls fit a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  const fitsViewport = () => page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth
  );
  expect(await fitsViewport()).toBe(true);

  await page.locator('#memories-button').click();
  await expect(page.locator('#memories-screen')).toBeVisible();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.movein"]')).toBeVisible();
  expect(await fitsViewport()).toBe(true);
  await page.locator('#memories-back').click();

  await page.locator('#gallery-button').click();
  await expect(page.locator('#gallery-screen')).toBeVisible();
  await expect(page.locator('#cg-grid button')).toHaveCount(8);
  expect(await fitsViewport()).toBe(true);
  await page.locator('#gallery-back').click();

  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  expect(await fitsViewport()).toBe(true);
  for (const selector of ['#game-memories-button', '#game-home-button']) {
    expect((await page.locator(selector).boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
});

test('default opening-demo plays COM-00 → COM-01X → COM-01J and ends at demo boundary', async ({ page }) => {
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await expect(page.locator('#title-main')).toHaveText('新鄰居');
  await expect(page.locator('#start-button')).toBeEnabled();
  await page.locator('#start-button').click();

  const seen = new Set();
  let usedKeyboardChoice = false;
  for (let step = 0; step < 120; step += 1) {
    if (await page.locator('#ending-screen').isVisible().catch(() => false)) break;
    await expect(page.locator('#game-shell')).toBeVisible();
    await waitForDialogueReady(page);
    const choiceButtons = page.locator('#choice-list .choice-button');
    const count = await choiceButtons.count();
    if (count > 0 && !(await page.locator('#choice-list').getAttribute('class') || '').includes('is-hidden')) {
      if (!usedKeyboardChoice) {
        const previousNode = (await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')))).cursor.nodeId;
        await choiceButtons.first().focus();
        await page.keyboard.press('Enter');
        await expect.poll(() => page.evaluate(() =>
          JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
        )).not.toBe(previousNode);
        usedKeyboardChoice = true;
      } else {
        await choiceButtons.nth(Math.min(1, count - 1)).click();
      }
    } else {
      const state = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2') || 'null'));
      if (state?.cursor?.nodeId) seen.add(state.cursor.nodeId);
      await page.locator('#advance-zone').click();
    }
  }

  await expect(page.locator('#ending-screen')).toBeVisible({ timeout: 5000 });
  expect(usedKeyboardChoice).toBe(true);
  await expect(page.locator('#ending-title')).toHaveText('第一章 Demo 完成');
  expect(await page.evaluate(() => localStorage.getItem('opening-demo-chapter-01:completed'))).toBe('1');

  await page.locator('#home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.movein"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.acg-first-meet"]')).toBeEnabled();

  await page.locator('#memories-back').click();
  await page.locator('#gallery-button').click();
  await expect(page.locator('#cg-grid button')).toHaveCount(8);
  await expect(page.locator('#cg-grid button:not(:disabled)')).toHaveCount(8);

  const finalJourney = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
  expect(finalJourney.frontierMemoryEventId).toBe('mem.opening.ch1.acg-first-meet');
  expect(finalJourney.frontierRank).toBe(140);
  expect(errors).toEqual([]);
});
