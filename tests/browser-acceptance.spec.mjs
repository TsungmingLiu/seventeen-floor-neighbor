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
  await expect(page.locator('#advance-hint')).toHaveText(/點擊繼續|選擇回應/, { timeout: 5000 });
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
  for (let step = 0; step < 120; step += 1) {
    if (await page.locator('#ending-screen').isVisible().catch(() => false)) break;
    await expect(page.locator('#game-shell')).toBeVisible();
    await waitForDialogueReady(page);
    const choiceButtons = page.locator('#choice-list .choice-button');
    const count = await choiceButtons.count();
    if (count > 0 && !(await page.locator('#choice-list').getAttribute('class') || '').includes('is-hidden')) {
      await choiceButtons.nth(Math.min(1, count - 1)).click();
    } else {
      const state = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2') || 'null'));
      if (state?.cursor?.nodeId) seen.add(state.cursor.nodeId);
      await page.locator('#advance-zone').click();
    }
  }

  await expect(page.locator('#ending-screen')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#ending-title')).toHaveText('第一章 Demo 完成');
  expect(await page.evaluate(() => localStorage.getItem('opening-demo-chapter-01:completed'))).toBe('1');

  await page.locator('#home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.movein"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.acg-first-meet"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toBeEnabled();

  await page.locator('#memories-back').click();
  await page.locator('#gallery-button').click();
  await expect(page.locator('#cg-grid button')).toHaveCount(8);
  await expect(page.locator('#cg-grid button:not(:disabled)')).toHaveCount(8);

  const finalJourney = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
  expect(finalJourney.frontierMemoryEventId).toBe('mem.opening.ch1.convenience-xu');
  expect(finalJourney.frontierRank).toBe(140);
  expect(errors).toEqual([]);
});

test('COM-02X reaches the ending through each locked choice and keeps preview out of Gallery', async ({ page }) => {
  const choiceIds = ['com02x_ask_food', 'com02x_share_work', 'com02x_tease_same', 'com02x_tell_eat_better'];
  for (let selected = 0; selected < choiceIds.length; selected += 1) {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#start-button').click();
    let branchChosen = false;
    let entryStats = null;
    for (let step = 0; step < 170; step += 1) {
      if (await page.locator('#ending-screen').isVisible().catch(() => false)) break;
      await waitForDialogueReady(page);
      const cursorNode = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2') || 'null')?.cursor?.nodeId
      );
      const choices = page.locator('#choice-list .choice-button');
      const count = await choices.count();
      if (cursorNode === 'common_convenience_xu_choice') {
        await expect(choices).toHaveCount(4);
        entryStats = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.stats);
        expect(await choices.nth(selected).textContent()).toContain([
          '附近這個時間', '我也是剛收工', '至少妳拿的看起來', '妳這樣常常太晚吃'
        ][selected]);
        await choices.nth(selected).click();
        branchChosen = true;
        await page.locator('#game-home-button').click();
        await page.reload();
        await page.locator('#start-button').click();
        await expect(page.locator('#dialogue-text')).toContainText(selected === 0
          ? '從回家的路上還要多繞五分鐘'
          : ['','那我們都選擇先能運作','我的有兩種顏色','今天晚，不等於每天晚'][selected]);
        const branchStats = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.stats);
        expect(branchStats.F_XT - entryStats.F_XT).toBe(selected === 0 ? 1 : 0);
        expect(branchStats.player_knows_xu_freelance_creative_work).toBe(0);
        expect(branchStats.xu_knows_player_remote_tech_work).toBe(0);
      } else if (count && !(await page.locator('#choice-list').getAttribute('class') || '').includes('is-hidden')) {
        await choices.nth(Math.min(1, count - 1)).click();
      } else {
        await page.locator('#advance-zone').click();
      }
    }
    expect(branchChosen, `${choiceIds[selected]} was reachable`).toBe(true);
    await expect(page.locator('#ending-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#ending-title')).toHaveText('第一章 Demo 完成');
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.stats);
    expect(stats.F_XT - entryStats.F_XT).toBe(selected === 0 ? 2 : 1);
    expect(stats.T_XT - entryStats.T_XT).toBe(selected === 1 ? 1 : 0);
    expect(stats.C_XT - entryStats.C_XT).toBe(selected === 2 ? 1 : 0);
    expect(stats.K_XT - entryStats.K_XT).toBe(selected === 3 ? -1 : 0);
    expect(stats.xt_advice_tendency - entryStats.xt_advice_tendency).toBe(selected === 3 ? 1 : 0);
    expect(stats.xt_boundary_strikes).toBe(entryStats.xt_boundary_strikes);
    expect(stats.contact_xu).toBe(entryStats.contact_xu);
    expect(stats.xu_romantic_signal).toBe(entryStats.xu_romantic_signal);
    expect(stats.contact_xu).toBe(0);
    expect(stats.xu_romantic_signal).toBe(0);
    expect(stats.player_knows_xu_freelance_creative_work).toBe(1);
    expect(stats.xu_knows_player_remote_tech_work).toBe(1);
    await page.locator('#home-button').click();
    await page.locator('#memories-button').click();
    await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toBeEnabled();
    await page.locator('#memories-back').click();
    const frontierFamiliarity = stats.F_XT;
    await page.locator('#memories-button').click();
    await page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]').click();
    await expect(page.locator('#dialogue-text')).toContainText('晚上十一點');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).frontier.stats.F_XT))
      .toBe(frontierFamiliarity);
    await page.locator('#game-home-button').click();
    await page.locator('#memories-button').click();
    await page.locator('#memories-back').click();
    await page.locator('#gallery-button').click();
    await expect(page.locator('#cg-grid button')).toHaveCount(8);
    await page.locator('#gallery-back').click();
  }
});
