import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173' });

const defaultStats = {
  heart: 0,
  trust: 0,
  chaos: 0,
  comfort: 0,
  relationship: 0,
  officeRoute: 0
};

function snapshot(nodeId, stats = {}, flags = [], returnNodes = []) {
  return {
    nodeId,
    stats: { ...defaultStats, ...stats },
    flags,
    returnNodes
  };
}

function legacyJourney(current, checkpoints = {}, edges = []) {
  return {
    version: 1,
    current,
    checkpoints: { [current.nodeId]: current, ...checkpoints },
    edges
  };
}

async function seedStorage(page, values) {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }, values);
}

function collectBlockingErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function boot(page) {
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await expect(page.locator('#start-button')).toBeEnabled();
  await expect(page.locator('#start-button')).toHaveText(/開始遊戲|繼續遊戲/);
}

async function waitForDialogueReady(page) {
  await expect(page.locator('#advance-hint')).toHaveText(/點擊繼續|選擇回應/, { timeout: 5000 });
}

test('fresh start persists, reloads, and exposes Memories/CG without blocking errors', async ({ page }) => {
  const errors = collectBlockingErrors(page);
  await boot(page);

  await expect(page.locator('#start-button')).toHaveText('開始遊戲');
  await expect(page.locator('#branches-button')).toHaveCount(0);
  await page.locator('#start-button').click();
  await expect(page.locator('#game-shell')).toBeVisible();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('週五');

  await page.locator('#advance-zone').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('一隻手從門縫外伸進來');

  const journey = await page.evaluate(() => JSON.parse(localStorage.getItem('chapter-01:journey:v2')));
  expect(journey.cursor.nodeId).toBe('intro2');
  expect(journey.frontierMemoryEventId).toBe('mem.story.start');

  await page.locator('#game-home-button').click();
  await expect(page.locator('#title-screen')).toBeVisible();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');

  await page.locator('#title-mute').click();
  await expect(page.locator('#title-mute')).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await expect(page.locator('#title-mute')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('週五');

  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('#memories-screen')).toBeVisible();
  await expect(page.locator('[data-memory-id="mem.story.start"]')).toBeEnabled();
  expect(await page.locator('.memory-card').count()).toBeGreaterThan(0);

  await page.locator('#memories-back').click();
  await page.locator('#gallery-button').click();
  await expect(page.locator('#gallery-screen')).toBeVisible();
  expect(await page.locator('#cg-grid button').count()).toBeGreaterThanOrEqual(17);

  expect(errors).toEqual([]);
});

test('legacy v1 save migrates and office branch choice resumes through the real choice UI', async ({ page }) => {
  const choice = snapshot('choice1');
  await seedStorage(page, {
    'chapter-01:journey:v1': legacyJourney(choice),
    neighborMuted: '1'
  });
  const errors = collectBlockingErrors(page);

  await boot(page);
  await page.locator('#start-button').click();
  await expect(page.locator('#choice-list')).not.toHaveClass(/is-hidden/, { timeout: 5000 });
  await expect(page.locator('#choice-list .choice-button')).toHaveCount(4);
  await page.locator('#choice-list .choice-button').nth(3).click();

  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText(/資料夾|加完班|電梯/);

  const current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('chapter-01:journey:v2')).cursor.nodeId
  );
  expect(current).toBe('office_intro');
  expect(errors).toEqual([]);
});

test('replaying an old Memory changes cursor but never regresses Continue frontier', async ({ page }) => {
  const intro = snapshot('intro1');
  const morning = snapshot('morning_after', {
    heart: 16,
    trust: 10,
    comfort: 5,
    relationship: 1
  });
  await seedStorage(page, {
    'chapter-01:journey:v1': legacyJourney(morning, { intro1: intro }),
    neighborMuted: '1'
  });
  const errors = collectBlockingErrors(page);

  await boot(page);
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.xu.sunday"]')).toHaveClass(/is-frontier/);
  await page.locator('[data-memory-id="mem.story.start"]').click();

  await waitForDialogueReady(page);
  let state = await page.evaluate(() => JSON.parse(localStorage.getItem('chapter-01:journey:v2')));
  expect(state.cursor.nodeId).toBe('intro1');
  expect(state.frontier.nodeId).toBe('morning_after');
  expect(state.frontierMemoryEventId).toBe('mem.xu.sunday');

  await page.locator('#game-home-button').click();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('第一次在 1702 醒來');

  state = await page.evaluate(() => JSON.parse(localStorage.getItem('chapter-01:journey:v2')));
  expect(state.cursor.nodeId).toBe('morning_after');
  expect(state.frontier.nodeId).toBe('morning_after');
  expect(errors).toEqual([]);
});

test('cinematic loads as a real 10-second video, can be skipped, and appears in gallery', async ({ page }) => {
  const cinematic = snapshot('first_kiss', {
    heart: 16,
    trust: 10,
    comfort: 5,
    relationship: 1
  });
  await seedStorage(page, {
    'chapter-01:journey:v1': legacyJourney(cinematic),
    neighborMuted: '1'
  });
  const errors = collectBlockingErrors(page);

  await boot(page);
  await page.locator('#start-button').click();

  await expect(page.locator('#stage')).toHaveClass(/is-cinematic-playing/, { timeout: 8000 });
  await expect(page.locator('#scene-video source')).toHaveCount(2);

  await expect.poll(async () => page.locator('#scene-video').evaluate(video => ({
    readyState: video.readyState,
    duration: Number.isFinite(video.duration) ? video.duration : 0
  })), { timeout: 10000 }).toMatchObject({ readyState: expect.any(Number) });

  const metadata = await page.locator('#scene-video').evaluate(video => ({
    readyState: video.readyState,
    duration: video.duration,
    sources: [...video.querySelectorAll('source')].map(source => source.src)
  }));
  expect(metadata.readyState).toBeGreaterThanOrEqual(1);
  expect(metadata.duration).toBeGreaterThan(9.5);
  expect(metadata.duration).toBeLessThan(10.6);
  expect(metadata.sources.some(src => src.includes('mv-first-kiss'))).toBe(true);

  await page.locator('#cinematic-skip').click();
  await expect(page.locator('#stage')).not.toHaveClass(/is-cinematic-playing/);
  await waitForDialogueReady(page);
  await expect(page.locator('#dialogue-text')).toContainText('第一個吻很輕');

  await page.locator('#game-home-button').click();
  await page.locator('#gallery-button').click();
  const cinematicCard = page.locator('button[aria-label*="第一次接吻"]');
  await expect(cinematicCard).toBeEnabled();
  await cinematicCard.click();

  await expect(page.locator('#cg-viewer')).toHaveAttribute('open', '');
  await expect(page.locator('#cg-viewer-video')).not.toHaveClass(/is-hidden/);
  await expect(page.locator('#cg-viewer-video source')).toHaveCount(2);

  expect(errors).toEqual([]);
});

test('route checkpoint resolves an ending and persists completion', async ({ page }) => {
  const route = snapshot('route', {
    heart: 16,
    trust: 10,
    comfort: 5,
    relationship: 1
  });
  await seedStorage(page, {
    'chapter-01:journey:v1': legacyJourney(route),
    neighborMuted: '1'
  });
  const errors = collectBlockingErrors(page);

  await boot(page);
  await page.locator('#start-button').click();

  await expect(page.locator('#ending-screen')).toBeVisible();
  await expect(page.locator('#ending-title')).toHaveText('1702，星期日早晨');
  expect(await page.evaluate(() => localStorage.getItem('chapter-01:completed'))).toBe('1');
  const endings = await page.evaluate(() => JSON.parse(localStorage.getItem('chapter-01:endings')));
  expect(endings).toContain('lover');

  await page.locator('#home-button').click();
  await expect(page.locator('#title-screen')).toBeVisible();
  expect(errors).toEqual([]);
});

test('320px viewport has no horizontal overflow on title, Memories, and game screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const errors = collectBlockingErrors(page);
  await boot(page);

  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await page.locator('#memories-button').click();
  await expect(page.locator('#memories-screen')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.locator('#memories-back').click();
  await page.locator('#start-button').click();
  await expect(page.locator('#game-shell')).toBeVisible();
  await waitForDialogueReady(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
