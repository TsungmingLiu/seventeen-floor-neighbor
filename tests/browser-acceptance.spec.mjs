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

async function enterPlayerName(page, name = '測試姓名') {
  if (!await page.locator('#player-name-dialog').isVisible()) return;
  await page.locator('#player-name-input').fill(name);
  await page.locator('#player-name-form button[type="submit"]').click();
  await expect(page.locator('#player-name-dialog')).not.toBeVisible();
}

async function galleryEntryCount(page) {
  const response = await page.request.get('/content/routes/opening-demo/assets.json');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  return Object.values(manifest.assets).filter((asset) =>
    ['cg', 'cinematic'].includes(asset.kind) && asset.gallery
  ).length;
}

test('opening-demo saves its real cursor and resumes after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#start-button').click();
  await enterPlayerName(page);
  await waitForDialogueReady(page);

  await page.locator('#advance-zone').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('還有三只紙箱，一張過不了門框的椅子。');
  const savedNode = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  );
  expect(savedNode).toBe('common_movein_rain_open_chair');

  await page.locator('#game-home-button').click();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  await enterPlayerName(page);
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('還有三只紙箱，一張過不了門框的椅子。');
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
  await expect(page.locator('#cg-grid button')).toHaveCount(await galleryEntryCount(page));
  expect(await fitsViewport()).toBe(true);
  await page.locator('#gallery-back').click();

  await page.locator('#start-button').click();
  await expect(page.locator('#player-name-dialog')).toBeVisible();
  const nameBox = await page.locator('#player-name-dialog').boundingBox();
  expect(nameBox.x).toBeGreaterThanOrEqual(0);
  expect(nameBox.x + nameBox.width).toBeLessThanOrEqual(320);
  expect(await fitsViewport()).toBe(true);
  await enterPlayerName(page);
  await waitForDialogueReady(page);
  expect(await fitsViewport()).toBe(true);
  for (const selector of ['#game-memories-button', '#game-home-button']) {
    expect((await page.locator(selector).boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
});

test('title Memories and Gallery stay disabled until delayed route data mounts', async ({ page }) => {
  let releaseIndexResponse;
  let signalIndexRequest;
  const indexResponseGate = new Promise(resolve => { releaseIndexResponse = resolve; });
  const indexRequestSeen = new Promise(resolve => { signalIndexRequest = resolve; });
  await page.route('**/content/routes/index.json', async route => {
    signalIndexRequest();
    await indexResponseGate;
    await route.continue();
  });

  await page.goto('/');
  await indexRequestSeen;
  await expect(page.locator('#memories-button')).toBeDisabled();
  await expect(page.locator('#gallery-button')).toBeDisabled();

  releaseIndexResponse();
  await expect(page.locator('#memories-button')).toBeEnabled();
  await expect(page.locator('#gallery-button')).toBeEnabled();
  await page.locator('#memories-button').click();
  await expect(page.locator('#memories-screen')).toBeVisible();
  await page.locator('#memories-back').click();
  await page.locator('#gallery-button').click();
  await expect(page.locator('#gallery-screen')).toBeVisible();
});

test('opening preview plays COM-00 → COM-01X → COM-01J → COM-02X and saves its shared exit', async ({ page }) => {
  test.setTimeout(120_000); // Full-story traversal includes the real typewriter animation.
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await expect(page.locator('#title-main')).toHaveText('新鄰居');
  await expect(page.locator('#start-button')).toBeEnabled();
  await page.locator('#start-button').click();
  await enterPlayerName(page);

  const seen = new Set();
  let usedKeyboardChoice = false;
  let sawPlayerName = false;
  let sawCom02xRecognitionCg = false;
  let sawCom02xChoiceBackground = false;
  for (let step = 0; step < 240; step += 1) {
    if (await page.locator('#ending-screen').isVisible().catch(() => false)) break;
    await expect(page.locator('#game-shell')).toBeVisible();
    await waitForDialogueReady(page);
    const activeNode = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
    );
    const currentSceneSrc = await page.locator('#scene-image').getAttribute('src');
    if (activeNode === 'common_convenience_xu_recognize') {
      expect(new URL(currentSceneSrc, page.url()).pathname).toBe('/assets/opening-ch1-demo/com02x-dlg-01-v1.webp');
      sawCom02xRecognitionCg = true;
    }
    if (activeNode === 'common_convenience_xu_choice') {
      expect(currentSceneSrc).toContain('/assets/opening-ch1-demo/com02x-bg-01-v1.webp');
      sawCom02xChoiceBackground = true;
    }
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
      if (state?.cursor?.nodeId === 'common_movein_rain_name_reply') {
        await expect(page.locator('#dialogue-text')).toContainText('測試姓名');
        sawPlayerName = true;
      }
      await page.locator('#advance-zone').click();
    }
  }

  await expect(page.locator('#ending-screen')).toBeVisible({ timeout: 5000 });
  expect(usedKeyboardChoice).toBe(true);
  expect(sawPlayerName).toBe(true);
  expect(sawCom02xRecognitionCg).toBe(true);
  expect(sawCom02xChoiceBackground).toBe(true);
  await expect(page.locator('#ending-title')).toHaveText('第一章 Demo 完成');
  expect(await page.evaluate(() => localStorage.getItem('opening-demo-chapter-01:completed'))).toBe('1');
  const finalJourney = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));

  await page.locator('#home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.movein"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.acg-first-meet"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toBeEnabled();

  await page.locator('#memories-back').click();
  await page.locator('#gallery-button').click();
  await expect(page.locator('#cg-grid button')).toHaveCount(await galleryEntryCount(page));
  await expect(page.locator('#cg-grid button:not(:disabled)')).toHaveCount(await galleryEntryCount(page));
  const galleryManifest = await (await page.request.get('/content/routes/opening-demo/assets.json')).json();
  expect(galleryManifest.assets['cg.opening.com02x.recognition'].gallery).toBeTruthy();
  expect(galleryManifest.assets['bg.opening.com02x.convenience_night'].gallery).toBeUndefined();

  await page.locator('#gallery-back').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]').click();
  await expect(page.locator('#game-shell')).toBeVisible();
  await waitForDialogueReady(page);
  for (let step = 0; step < 20; step += 1) {
    const nodeId = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
    );
    const imageSrc = await page.locator('#scene-image').getAttribute('src');
    if (nodeId === 'common_convenience_xu_recognize') {
      expect(imageSrc).toContain('/assets/opening-ch1-demo/com02x-dlg-01-v1.webp');
    }
    if (nodeId === 'common_convenience_xu_choice') {
      expect(imageSrc).toContain('/assets/opening-ch1-demo/com02x-bg-01-v1.webp');
      await page.locator('#choice-list .choice-button').first().click();
      break;
    }
    await page.locator('#advance-zone').click();
    await waitForDialogueReady(page);
  }
  const replayNode = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  );
  expect(replayNode).toBe('common_convenience_xu_ask_food');
  await page.reload();
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  )).toBe(replayNode);

  expect(finalJourney.playerDisplayName).toBe('測試姓名');
  expect(finalJourney.frontierMemoryEventId).toBe('mem.opening.ch1.convenience-xu');
  expect(finalJourney.frontierRank).toBe(160);
  expect(finalJourney.cursor.stats.F_XT).toBeGreaterThanOrEqual(2);
  expect(finalJourney.cursor.flags).toContain('player_knows_xu_freelance_creative_work');
  expect(seen.has('common_convenience_xu_work')).toBe(true);
  expect(errors).toEqual([]);
});


test('entered name persists through Continue and Memory replay without replacing story data', async ({ page }) => {
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await page.locator('#start-button').click();
  await expect(page.locator('#player-name-dialog')).toBeVisible();
  await page.locator('#player-name-input').fill('   ');
  await page.locator('#player-name-form button[type="submit"]').click();
  await expect(page.locator('#player-name-error')).not.toBeEmpty();
  await expect(page.locator('#game-shell')).not.toBeVisible();
  await enterPlayerName(page, '小雨');

  for (let step = 0; step < 80; step += 1) {
    await waitForDialogueReady(page);
    const node = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId);
    if (node === 'common_movein_rain_name_reply') break;
    const choices = page.locator('#choice-list .choice-button');
    if (await page.locator('#choice-list').isVisible()) await choices.first().click();
    else await page.locator('#advance-zone').click();
  }
  await expect(page.locator('#dialogue-text')).toContainText('小雨');
  await expect(page.locator('#speaker')).toHaveText('小雨');
  await page.reload();
  await page.locator('#start-button').click();
  await expect(page.locator('#player-name-dialog')).not.toBeVisible();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('小雨');
  await expect(page.locator('#speaker')).toHaveText('小雨');

  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-memory-id="mem.opening.ch1.movein"]').click();
  await expect(page.locator('#player-name-dialog')).not.toBeVisible();
  for (let step = 0; step < 80; step += 1) {
    await waitForDialogueReady(page);
    const node = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId);
    if (node === 'common_movein_rain_name_reply') break;
    if (await page.locator('#choice-list').isVisible()) await page.locator('#choice-list .choice-button').first().click();
    else await page.locator('#advance-zone').click();
  }
  await expect(page.locator('#dialogue-text')).toContainText('小雨');
  await expect(page.locator('#speaker')).toHaveText('小雨');
  expect(errors).toEqual([]);
});

test('narration and thought use matching upright text typography', async ({ page }) => {
  await page.goto('/');
  const typography = async (mode) => page.locator('#dialogue-panel').evaluate((panel, nextMode) => {
    panel.dataset.mode = nextMode;
    const style = getComputedStyle(panel.querySelector('#dialogue-text'));
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontStyle: style.fontStyle,
      letterSpacing: style.letterSpacing,
      color: style.color
    };
  }, mode);

  const narration = await typography('narration');
  const thought = await typography('thought');
  expect(narration.fontStyle).toBe('normal');
  expect(thought.fontStyle).toBe('normal');
  expect(thought).toEqual(narration);
});

test('pre-COM02X save keeps progress and asks for a name before Continue or replay', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const chapter = await (await fetch('/content/routes/opening-demo/chapter.json')).json();
    const stats = { ...chapter.initialState, F_XT: 2 };
    for (const key of ['T_XT', 'K_XT', 'xt_advice_tendency']) delete stats[key];
    const snapshot = { nodeId: 'common_elevator_restart_greeting', stats, flags: ['test-flag'], returnNodes: [] };
    localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify({ version: 2, cursor: snapshot, frontier: snapshot, checkpoints: { [snapshot.nodeId]: snapshot }, edges: [] }));
  });
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  await expect(page.locator('#player-name-dialog')).toBeVisible();
  await page.locator('#player-name-cancel').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]').click();
  await expect(page.locator('#player-name-dialog')).toBeVisible();
  await enterPlayerName(page, '新名字');
  await waitForDialogueReady(page);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
  expect(saved.cursor.nodeId).toBe('common_elevator_restart_greeting');
  expect(saved.cursor.stats.F_XT).toBe(2);
  expect(saved.cursor.stats.T_XT).toBe(0);
  expect(saved.cursor.flags).toContain('test-flag');
  expect(saved.playerDisplayName).toBe('新名字');
});
