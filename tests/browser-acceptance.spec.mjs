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

function com02xImageForNode(id) {
  if (!id?.startsWith('common_convenience_xu_')) return null;
  if (id === 'common_convenience_xu_choice' || /^common_convenience_xu_recognize(?:_|$)/.test(id)
    || /^common_convenience_xu_(ask_food|share_work|tease_same)(?:_|$)/.test(id)
    || /^common_convenience_xu_tell_eat_better(?:_0[23])?$/.test(id)) return 'com02x-dlg-01-v1.webp';
  if (/^common_convenience_xu_work_(0[2-9]|1[0-5])$/.test(id)) return 'com02x-microwave-v1.webp';
  if (/^common_convenience_xu_checkout_(0[4-9]|1[0-3])$/.test(id)) return 'com02x-walk-v3.webp';
  if (['common_convenience_xu_exit', 'common_convenience_xu_exit_02'].includes(id)) return 'return-elevator-trial-v1.webp';
  if (id === 'common_convenience_xu_checkout_14' || /^common_convenience_xu_exit(?:_|$)/.test(id)) return 'apartment-elevator.webp';
  return 'com02x-bg-01-v1.webp';
}

async function currentJourney(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
}

test('Memories disclosure, character focus, cursor marker and frontier jump stay view-only', async ({ page }) => {
  await page.goto('/');
  const [chapter, library] = await Promise.all([
    page.request.get('/content/routes/opening-demo/chapter.json').then(response => response.json()),
    page.request.get('/content/routes/opening-demo/memories.json').then(response => response.json())
  ]);
  const snapshots = Object.fromEntries(library.events.map(event => {
    const snapshot = { nodeId: event.replayNode, stats: chapter.initialState, flags: [], returnNodes: [] };
    return [event.replayNode, snapshot];
  }));
  const frontier = snapshots[library.events[1].replayNode];
  const cursor = snapshots[library.events[3].replayNode];
  const saved = { version: 2, playerDisplayName: '小雨', cursor, frontier, runComplete: false,
    checkpoints: snapshots, edges: [] };
  await page.addInitScript(journey => localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify(journey)), saved);
  await page.goto('/');
  await page.locator('#memories-button').click();

  const section = page.locator('#memory-list details');
  await expect(section).toHaveAttribute('open', '');
  await expect(page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]')).toBeVisible();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toHaveClass(/is-reading/);
  await expect(page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]')).toHaveClass(/is-frontier/);

  await page.locator('#memory-filters button').filter({ hasText: '許棠' }).click();
  await expect(page.locator('.memory-character-context')).toContainText('江雨澄：已探索 3 段');
  await expect(page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]')).toHaveCount(0);

  await section.locator('summary').click();
  await expect(section).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-memory-id="mem.opening.ch1.movein"]')).not.toBeVisible();

  const journeyBefore = await currentJourney(page);
  await page.locator('#memories-current').click();
  await expect(page.locator('#memory-filters button').filter({ hasText: '全部' })).toHaveAttribute('aria-pressed', 'true');
  await expect(section).toHaveAttribute('open', '');
  const frontierCard = page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]');
  await expect(frontierCard).toBeFocused();
  await expect(page.locator('#memory-announcement')).toHaveText('已返回目前進度：電梯重啟');
  expect(await currentJourney(page)).toEqual(journeyBefore);
  // The first desktop row can already be visible without scrolling. Check the
  // focused event's readable title, including when a card is taller than the list.
  await expect.poll(() => frontierCard.locator('strong').evaluate(title => {
    const target = title.getBoundingClientRect();
    const list = title.closest('#memory-list').getBoundingClientRect();
    return target.width > 0 && target.height > 0
      && target.top >= Math.max(0, list.top) && target.bottom <= Math.min(innerHeight, list.bottom)
      && target.left >= Math.max(0, list.left) && target.right <= Math.min(innerWidth, list.right);
  })).toBe(true);
  const scrollState = await page.locator('#memory-list').evaluate(list => ({
    left: list.scrollLeft,
    pageLeft: window.scrollX
  }));
  expect(scrollState.left).toBe(0);
  expect(scrollState.pageLeft).toBe(0);
});

test('Opening names appear at exchange and early Memory stays anonymous after later knowledge', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await page.locator('#start-button').click();
  await enterPlayerName(page, '小雨');
  const chapter = await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  let xuRevealed = false;
  const reloaded = new Set();
  let anonymousXu = 0;
  let anonymousJyc = 0;
  for (let step = 0; step < 150; step++) {
    await waitForDialogueReady(page);
    const journey = await currentJourney(page);
    const id = journey.cursor.nodeId;
    if (id === 'common_convenience_xu_enter') break;
    const node = chapter.nodes[id];
    if (id === 'common_movein_rain_names') xuRevealed = true;
    if (node.speaker === '許棠') {
      await expect(page.locator('#speaker')).toHaveText(xuRevealed ? '許棠' : '女生');
      if (!xuRevealed) anonymousXu++;
    }
    if (node.speaker === '江雨澄') {
      await expect(page.locator('#speaker')).toHaveText('女生');
      anonymousJyc++;
    }
    if (['common_movein_rain_joke_locked_01', 'common_movein_rain_names'].includes(id) && !reloaded.has(id)) {
      reloaded.add(id);
      await page.reload();
      await page.locator('#start-button').click();
      await waitForDialogueReady(page);
      expect((await currentJourney(page)).cursor).toEqual(journey.cursor);
      await expect(page.locator('#speaker')).toHaveText(xuRevealed ? '許棠' : '女生');
    }
    if (node.choices) {
      if (!await page.locator('#choice-list').isVisible()) await page.locator('#advance-zone').click();
      await page.locator('#choice-list .choice-button').nth(1).click();
    } else await page.locator('#advance-zone').click();
    await expect.poll(async () => (await currentJourney(page)).cursor.nodeId).not.toBe(id);
  }
  const journey = await currentJourney(page);
  expect(journey.cursor.nodeId).toBe('common_convenience_xu_enter');
  expect(anonymousXu).toBeGreaterThan(0);
  expect(anonymousJyc).toBeGreaterThan(0);
  expect(reloaded.size).toBe(2);
  // A later known-name save must not determine an earlier moment's labels.
  await page.evaluate(() => {
    const key = 'opening-demo-chapter-01:journey:v2';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.cursor.flags.push('player_knows_jyc_name');
    saved.frontier.flags.push('player_knows_jyc_name');
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await page.locator('#memories-button').click();
  await page.locator('[data-memory-id="mem.opening.ch1.movein"]').click();
  for (let step = 0; step < 10; step++) {
    await waitForDialogueReady(page);
    if ((await currentJourney(page)).cursor.nodeId === 'common_movein_rain_move') break;
    await page.locator('#advance-zone').click();
  }
  await expect(page.locator('#speaker')).toHaveText('女生');
  const replay = await currentJourney(page);
  expect(replay.playerDisplayName).toBe('小雨');
  expect(replay.frontier.stats).toEqual(journey.frontier.stats);
  expect(replay.frontier.flags).toContain('player_knows_jyc_name');
  expect(errors).toEqual([]);
});

for (const mode of ['confirm', 'Enter', 'cleared', 'whitespace']) {
  test(`player name quick-start uses the prefilled default with ${mode}`, async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-button').click();
    const input = page.locator('#player-name-input');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('劉樂');
    if (mode === 'cleared') {
      await input.click();
      await expect(input).toHaveValue('');
      await expect(input).toBeFocused();
    }
    if (mode === 'whitespace') await input.fill('   ');
    if (mode === 'Enter') await page.keyboard.press('Enter');
    else await page.locator('#player-name-form button[type="submit"]').click();
    await expect(page.locator('#player-name-dialog')).not.toBeVisible();
    await expect(page.locator('#game-shell')).toBeVisible();
    expect((await currentJourney(page)).playerDisplayName).toBe('劉樂');
    await page.reload();
    await page.locator('#start-button').click();
    await expect(page.locator('#player-name-dialog')).not.toBeVisible();
    expect((await currentJourney(page)).playerDisplayName).toBe('劉樂');
  });
}

test('player name first click clears with a cursor and later clicks or cancel/reopen preserve the custom draft', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-button').click();
  const input = page.locator('#player-name-input');
  await input.click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  expect(await input.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 0]);
  await page.keyboard.insertText('小雨');
  await input.click();
  await expect(input).toHaveValue('小雨');
  await page.locator('#player-name-cancel').click();
  expect(await currentJourney(page)).toBeNull();
  await page.locator('#start-button').click();
  await expect(input).toHaveValue('小雨');
  await input.click();
  await expect(input).toHaveValue('小雨');
  await page.locator('#player-name-form button[type="submit"]').click();
  expect((await currentJourney(page)).playerDisplayName).toBe('小雨');
});

for (const mode of ['keyboard', 'native beforeinput', 'IME', 'autofill']) {
  test(`player name ${mode} edits preserve custom text`, async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-button').click();
    const input = page.locator('#player-name-input');
    await expect(input).toHaveValue('劉樂');
    await expect(input).toBeFocused();
    if (mode === 'keyboard') await page.keyboard.type('Amy');
    if (mode === 'native beforeinput') await page.keyboard.insertText('小雨');
    if (mode === 'IME') {
      // Browser-native composition events model an IME edit; no physical IME is available in CI.
      await input.dispatchEvent('compositionstart', { data: '' });
      await expect(input).toHaveValue('');
      await input.evaluate(el => {
        el.value = '小';
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: '小', inputType: 'insertCompositionText', isComposing: true }));
        el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, data: '小雨', inputType: 'insertCompositionText', isComposing: true }));
        el.value = '小雨';
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: '小雨', inputType: 'insertCompositionText', isComposing: true }));
        el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '小雨' }));
      });
    }
    if (mode === 'autofill') await input.evaluate(el => { el.value = '小雨'; });
    const customName = mode === 'keyboard' ? 'Amy' : '小雨';
    await expect(input).toHaveValue(customName);
    await input.click();
    await expect(input).toHaveValue(customName);
    await page.locator('#player-name-form button[type="submit"]').click();
    expect((await currentJourney(page)).playerDisplayName).toBe(customName);
  });
}

for (const [branchIndex, branch] of ['ask_food', 'share_work', 'tease_same', 'tell_eat_better'].entries()) {
  test(`COM-02X ${branch} forward flow loads held CGs, ten walking nodes, reload and Gallery`, async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    const errors = collectBlockingErrors(page);
    await page.goto('/');
    await expect(page.locator('#start-button')).toBeEnabled();
    await page.locator('#start-button').click();
    await enterPlayerName(page);
    const scopedSeen = new Map();
    let reloadedWalk = false;
    let choiceTaken = false;
    let previousScopedSrc = null;
    const switches = [];
    const runtimeAssets = await (await page.request.get('/content/routes/opening-demo/assets.json')).json();
    const apartmentPath = `/${runtimeAssets.assets['bg.opening.ch1.apt_elevator'].src}`;
    for (let step = 0; step < 360; step += 1) {
      if (await page.locator('#ending-screen').isVisible()) break;
      await waitForDialogueReady(page);
      const journey = await currentJourney(page);
      const id = journey.cursor.nodeId;
      const expected = com02xImageForNode(id);
      if (expected) {
        const expectedPath = expected === 'apartment-elevator.webp' ? apartmentPath : expected === 'return-elevator-trial-v1.webp' ? `/assets/opening-ch1-preview/${expected}` : `/assets/opening-ch1-demo/${expected}`;
        const scene = page.locator('#scene-image');
        await expect.poll(async () => new URL(await scene.getAttribute('src'), page.url()).pathname).toBe(expectedPath);
        await expect.poll(() => scene.evaluate(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)).toBe(true);
        scopedSeen.set(id, expected);
        if (previousScopedSrc !== expected) switches.push({ node: id, image: expected });
        previousScopedSrc = expected;
        if (id === 'common_convenience_xu_checkout_08' && !reloadedWalk) {
          await testInfo.attach(`${branch}-walk`, { body: await page.screenshot(), contentType: 'image/png' });
          await page.reload();
          await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
          await page.locator('#start-button').click();
          await waitForDialogueReady(page);
          const restored = await currentJourney(page);
          expect(restored.cursor).toEqual(journey.cursor);
          expect(restored.frontier).toEqual(journey.frontier);
          expect(restored.frontierRank).toBe(160);
          await expect.poll(() => page.locator('#scene-image').evaluate(image => image.complete && image.naturalWidth === 1672 && image.naturalHeight === 941)).toBe(true);
          expect(new URL(await page.locator('#scene-image').getAttribute('src'), page.url()).pathname).toBe('/assets/opening-ch1-demo/com02x-walk-v3.webp');
          reloadedWalk = true;
        }
      }
      if (id === 'common_convenience_xu_exit_08') break;
      const choices = page.locator('#choice-list .choice-button');
      if ((await page.locator('#advance-hint').textContent()) === '點擊選擇' && !await page.locator('#choice-list').isVisible()) {
        await page.locator('#advance-zone').click();
        await expect(page.locator('#choice-list')).toBeVisible();
      }
      if (await choices.count() && await page.locator('#choice-list').isVisible()) {
        if (id === 'common_convenience_xu_choice') {
          await choices.nth(branchIndex).click();
          choiceTaken = true;
        } else await choices.first().click();
      } else await page.locator('#advance-zone').click();
      await expect.poll(async () => (await currentJourney(page)).cursor.nodeId).not.toBe(id);
    }
    await expect(page.locator('#game-shell')).toBeVisible();
    expect((await currentJourney(page)).cursor.nodeId).toBe('common_convenience_xu_exit_08');
    expect(choiceTaken).toBe(true);
    expect(reloadedWalk).toBe(true);
    expect(scopedSeen.get(`common_convenience_xu_${branch}`)).toBe('com02x-dlg-01-v1.webp');
    for (let n = 2; n <= 15; n += 1) expect(scopedSeen.get(`common_convenience_xu_work_${String(n).padStart(2, '0')}`)).toBe('com02x-microwave-v1.webp');
    for (let n = 4; n <= 13; n += 1) expect(scopedSeen.get(`common_convenience_xu_checkout_${String(n).padStart(2, '0')}`)).toBe('com02x-walk-v3.webp');
    for (const id of ['common_convenience_xu_work', 'common_convenience_xu_work_16', 'common_convenience_xu_work_17', 'common_convenience_xu_checkout_03']) expect(scopedSeen.get(id)).toBe('com02x-bg-01-v1.webp');
    if (branch === 'tell_eat_better') {
      for (let n = 4; n <= 7; n += 1) expect(scopedSeen.get(`common_convenience_xu_tell_eat_better_0${n}`)).toBe('com02x-bg-01-v1.webp');
    }
    expect(scopedSeen.get('common_convenience_xu_checkout_14')).toBe('apartment-elevator.webp');
    const finished = await currentJourney(page);
    expect(finished.frontierRank).toBe(160);
    expect(finished.runComplete).toBe(false);
    await page.locator('#game-home-button').click();
    await page.locator('#memories-button').click();
    await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toBeEnabled();
    await page.locator('#memories-back').click();
    await page.locator('#gallery-button').click();
    for (const [assetId, title] of [['cg.opening.com02x.recognition', '深夜便利店'], ['cg.opening.com02x.microwave_wait', '深夜便利店・微波等待'], ['cg.opening.com02x.walk_home', '深夜便利店・一起回家']]) {
      const card = page.locator(`#cg-grid button[aria-label="查看 ${title}"]`);
      await expect(card).toBeEnabled();
      await card.click();
      await expect(page.locator('#cg-viewer')).toBeVisible();
      await expect.poll(async () => new URL(await page.locator('#cg-viewer-image').getAttribute('src'), page.url()).pathname).toBe(`/${runtimeAssets.assets[assetId].src}`);
      await expect.poll(() => page.locator('#cg-viewer-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.locator('#cg-viewer-close').click();
    }
    await testInfo.attach(`${branch}-runtime-flow`, { body: Buffer.from(JSON.stringify({ branch, scopedSeen: Object.fromEntries(scopedSeen), switches, reloadedWalk, frontierRank: finished.frontierRank, galleryVerified: 3, errors }, null, 2)), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
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

test('opening preview plays through COM-03J and saves its shared exit', async ({ page }) => {
  test.setTimeout(240_000); // Full-story traversal includes the real typewriter animation.
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
  let sawCom02xChoiceCg = false;
  for (let step = 0; step < 360; step += 1) {
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
      expect(new URL(currentSceneSrc, page.url()).pathname).toBe('/assets/opening-ch1-demo/com02x-dlg-01-v1.webp');
      sawCom02xChoiceCg = true;
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
  expect(sawCom02xChoiceCg).toBe(true);
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
      expect(new URL(imageSrc, page.url()).pathname).toBe('/assets/opening-ch1-demo/com02x-dlg-01-v1.webp');
    }
    if (nodeId === 'common_convenience_xu_choice') {
      expect(new URL(imageSrc, page.url()).pathname).toBe('/assets/opening-ch1-demo/com02x-dlg-01-v1.webp');
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
  const replayJourney = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
  expect(replayJourney.frontier).toEqual(finalJourney.frontier);
  expect(replayJourney.runComplete).toBe(true);
  expect(replayJourney.restartActive).toBe(false);
  await page.reload();
  await expect(page.locator('#start-button')).toBeEnabled();
  await expect(page.locator('#start-button')).toHaveText('開始遊戲');
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  )).toBe(replayNode);

  // The completed story offers Start; only an explicit new run resumes its cursor.
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  )).toBe('common_movein_rain_open');
  const restartedJourney = await page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
  expect(restartedJourney.frontier).toEqual(finalJourney.frontier);
  expect(restartedJourney.restartActive).toBe(true);
  expect(restartedJourney.runComplete).toBe(false);
  await page.locator('#advance-zone').click();
  await waitForDialogueReady(page);
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  )).toBe('common_movein_rain_open_chair');
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  await waitForDialogueReady(page);
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')).cursor.nodeId
  )).toBe('common_movein_rain_open_chair');

  expect(finalJourney.playerDisplayName).toBe('測試姓名');
  expect(finalJourney.cursor.nodeId).toBe('com03j_preview_complete');
  const memoryLibrary = await (await page.request.get('/content/routes/opening-demo/memories.json')).json();
  const finalMemory = memoryLibrary.events.find(event => event.unlockNodes.includes(finalJourney.cursor.nodeId));
  expect(finalMemory.id).toBe('mem.opening.ch1.recommend-discord-jyc');
  expect(finalJourney.frontierMemoryEventId).toBe(finalMemory.id);
  expect(finalJourney.frontierRank).toBe(finalMemory.progressRank);
  expect(finalJourney.cursor.stats.F_XT).toBeGreaterThanOrEqual(2);
  expect(finalJourney.cursor.flags).toContain('player_knows_xu_freelance_creative_work');
  expect(seen.has('common_convenience_xu_work')).toBe(true);
  const chronology = [...seen];
  expect(chronology.indexOf('common_convenience_xu_enter')).toBeLessThan(chronology.indexOf('common_station_cafe_jyc_enter'));
  expect(chronology.indexOf('common_station_cafe_jyc_enter')).toBeLessThan(chronology.indexOf('common_package_xu_arrive'));
  expect(errors).toEqual([]);
});


test('entered name persists through Continue and Memory replay without replacing story data', async ({ page }) => {
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await page.locator('#start-button').click();
  await expect(page.locator('#player-name-dialog')).toBeVisible();
  await page.locator('#player-name-input').fill('[bad]');
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


for (const width of [320, 1440]) {
  test(`dedicated initial title artwork preserves framing and saved backdrop at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 700 : 900 });
    const errors = collectBlockingErrors(page);
    await page.goto('/');
    const art = page.locator('#title-art');
    await expect(art).toHaveAttribute('src', 'assets/opening-title/title-17f-doorlight-v1.webp');
    await expect(art).toHaveClass(/is-initial-title-art/);
    await expect.poll(() => art.evaluate((el) => getComputedStyle(el).objectPosition)).toBe('50% 40%');
    expect(await art.evaluate((el) => el.complete && el.naturalWidth === 1672)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#start-button').click();
    await expect(page.locator('#player-name-input')).toHaveValue('劉樂');
    await page.locator('#player-name-cancel').click();
    await expect(art).toHaveAttribute('src', 'assets/opening-title/title-17f-doorlight-v1.webp');
    await page.evaluate(async () => {
      const chapter = await (await fetch('/content/routes/opening-demo/chapter.json')).json();
      const snapshot = { nodeId: 'common_elevator_restart_greeting', stats: chapter.initialState, flags: [], returnNodes: [] };
      localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify({ version: 2, playerDisplayName: '劉樂', cursor: snapshot, frontier: snapshot,
        frontierMemoryEventId: 'mem.opening.ch1.elevator-restart', frontierRank: 40, checkpoints: { [snapshot.nodeId]: snapshot }, edges: [] }));
    });
    await page.reload();
    await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
    await expect(art).not.toHaveClass(/is-initial-title-art/);
    await expect(art).not.toHaveAttribute('src', 'assets/opening-title/title-17f-doorlight-v1.webp');
    const memories = await (await page.request.get('/content/routes/opening-demo/memories.json')).json();
    const assets = await (await page.request.get('/content/routes/opening-demo/assets.json')).json();
    const event = memories.events.find((event) => event.id === 'mem.opening.ch1.elevator-restart');
    await expect(art).toHaveAttribute('src', assets.assets[event.titleBackdropAsset || event.cover.asset].src);
    await page.locator('#start-button').click();
    await expect(page.locator('#player-name-dialog')).not.toBeVisible();
    expect((await currentJourney(page)).playerDisplayName).toBe('劉樂');
    expect(errors).toEqual([]);
  });
}

for (const [branchIndex, tone] of ['mc_tone_observant', 'mc_tone_practical', 'mc_tone_humorous'].entries()) {
  test(`COM03X old completed save Continue, branch ${branchIndex + 1}, reload, Memory isolation and final Start`, async ({ page }, testInfo) => {
    test.setTimeout(150_000);
    const errors = collectBlockingErrors(page);
    await page.goto('/');
    const chapter = await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
    const memoryLibrary = await (await page.request.get('/content/routes/opening-demo/memories.json')).json();
    expect(memoryLibrary.events.map(event => event.id)).toEqual([
      'mem.opening.ch1.movein', 'mem.opening.ch1.elevator-restart',
      'mem.opening.ch1.acg-first-meet', 'mem.opening.ch1.convenience-xu', 'mem.opening.ch1.station-cafe-jyc', 'mem.opening.ch1.recommend-discord-jyc'
    ]);
    const stats = { ...chapter.initialState, F_XT: 7, T_XT: 3, K_XT: 2, xt_advice_tendency: 1,
      mc_tone_observant: 4, mc_tone_practical: 5, mc_tone_humorous: 6 };
    const flags = ['player_knows_xu_freelance_creative_work', 'xu_knows_player_remote_tech_work', 'prior-boundary-history', 'entry-effect:common_convenience_xu_exit_08'];
    await page.evaluate(({ stats, flags }) => {
      const cursor = { nodeId: 'opening_demo_complete', stats, flags, returnNodes: [] };
      const frontier = { ...cursor, nodeId: 'common_convenience_xu_exit_08' };
      localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify({ version: 2, playerDisplayName: '小雨', cursor, frontier,
        restartActive: false, runComplete: true, checkpoints: { opening_demo_complete: cursor, common_convenience_xu_exit_08: frontier }, edges: [['common_convenience_xu_exit_08', 'opening_demo_complete']] }));
    }, { stats, flags });
    await page.reload();
    await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
    await page.locator('#start-button').click();
    expect((await currentJourney(page)).cursor.nodeId).toBe('common_station_cafe_jyc_enter');
    expect((await currentJourney(page)).cursor.stats).toEqual(stats);
    const seen = new Set();
    let reloaded = false;
    let memoryChecked = false;
    for (let step = 0; step < 260; step += 1) {
      if (await page.locator('#ending-screen').isVisible()) break;
      await waitForDialogueReady(page);
      const journey = await currentJourney(page);
      const id = journey.cursor.nodeId;
      seen.add(id);
      await expect.poll(() => page.locator('#scene-image').evaluate(image => image.complete && image.naturalWidth === 1600 && image.naturalHeight === 900)).toBe(true);
      expect(new URL(await page.locator('#scene-image').getAttribute('src'), page.url()).pathname).toBe('/assets/ui/narrative-preview-v1.webp');
      if (id === 'common_package_xu_proof_10' && !reloaded) {
        await page.reload();
        await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
        await page.locator('#start-button').click();
        expect((await currentJourney(page)).cursor).toEqual(journey.cursor);
        reloaded = true;
        await waitForDialogueReady(page);
      }
      if (id === 'common_package_xu_line' && !memoryChecked) {
        await testInfo.attach(`com03x-branch-${branchIndex + 1}-preview`, { body: await page.screenshot(), contentType: 'image/png' });
        await page.locator('#game-memories-button').click();
        // This sparse save unlocks movein, convenience and the played cafe scene;
        // the first locked event remains visible without exposing its title.
        await expect(page.locator('.memory-card')).toHaveCount(4);
        expect(await page.locator('.memory-card').evaluateAll(cards => cards.map(card => card.dataset.memoryId)))
          .toEqual(['mem.opening.ch1.movein', 'mem.opening.ch1.elevator-restart', 'mem.opening.ch1.convenience-xu', 'mem.opening.ch1.station-cafe-jyc']);
        await expect(page.locator('[data-memory-id="mem.opening.ch1.elevator-restart"]')).toBeDisabled();
        await expect(page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]')).toBeEnabled();
        await page.locator('[data-memory-id="mem.opening.ch1.convenience-xu"]').click();
        await waitForDialogueReady(page);
        expect((await currentJourney(page)).cursor.nodeId).toBe('common_convenience_xu_exit_08');
        await page.locator('#advance-zone').click();
        await expect(page.locator('#title-screen')).toBeVisible();
        const replay = await currentJourney(page);
        expect(replay.frontier).toEqual(journey.frontier);
        expect(replay.runComplete).toBe(false);
        expect(replay.cursor.flags).not.toContain('contact_xu');
        await page.reload();
        await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
        await page.locator('#start-button').click();
        expect((await currentJourney(page)).cursor).toEqual(journey.cursor);
        memoryChecked = true;
        await waitForDialogueReady(page);
      }
      if (chapter.nodes[id].choices) {
        if (!await page.locator('#choice-list').isVisible()) await page.locator('#advance-zone').click();
        await expect(page.locator('#choice-list')).toBeVisible();
        await page.locator('#choice-list .choice-button').nth(id.startsWith('common_station_cafe_jyc_choice_') ? 0 : branchIndex).click();
      } else await page.locator('#advance-zone').click();
    }
    await expect(page.locator('#ending-screen')).toBeVisible();
    expect(reloaded).toBe(true);
    expect(memoryChecked).toBe(true);
    for (const id of ['common_package_xu_proof', 'common_package_xu_callback', 'common_package_xu_line', 'common_package_xu_exit', 'common_package_xu_first_message']) expect(seen.has(id)).toBe(true);
    const finished = await currentJourney(page);
    expect(finished.cursor.nodeId).toBe('com03j_preview_complete');
    expect(finished.cursor.stats).toEqual({ ...stats, F_XT: 8, F_JYC: stats.F_JYC + 2, T_JYC: stats.T_JYC + 1, [tone]: stats[tone] + 1 });
    expect(finished.cursor.flags).toEqual(expect.arrayContaining([...flags, 'contact_xu']));
    expect(finished.playerDisplayName).toBe('小雨');
    expect(finished.runComplete).toBe(true);
    await page.locator('#home-button').click();
    await page.locator('#gallery-button').click();
    await expect(page.locator('#cg-grid button')).toHaveCount(await galleryEntryCount(page));
    expect(await page.locator('#cg-grid img').evaluateAll(images => images.some(image => image.src.includes('narrative-preview')))).toBe(false);
    await page.locator('#gallery-back').click();
    // A Memory cursor at the historical terminal cannot regress a completed newer frontier.
    await page.evaluate(() => {
      const key = 'opening-demo-chapter-01:journey:v2';
      const saved = JSON.parse(localStorage.getItem(key));
      saved.cursor = saved.checkpoints.opening_demo_complete;
      localStorage.setItem(key, JSON.stringify(saved));
    });
    await page.reload();
    await expect(page.locator('#start-button')).toHaveText('開始遊戲');
    expect((await currentJourney(page)).frontier).toEqual(finished.frontier);
    await page.locator('#start-button').click();
    expect((await currentJourney(page)).cursor.nodeId).toBe(chapter.startNode);
    expect((await currentJourney(page)).cursor.stats.F_XT).toBe(0);
    await testInfo.attach(`com03x-branch-${branchIndex + 1}-evidence`, { body: Buffer.from(JSON.stringify({ branchIndex, seen: [...seen], finalStats: finished.cursor.stats, reloaded, memoryChecked, errors })), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
}

test('invalid old completed cursor keeps safe explicit Start fallback', async ({ page }) => {
  await page.goto('/');
  const chapter = await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  await page.evaluate(initialState => {
    const cursor = { nodeId: 'deleted-node', stats: initialState, flags: [], returnNodes: [] };
    localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify({ version: 2, playerDisplayName: '小雨', cursor,
      frontier: null, restartActive: false, runComplete: true, checkpoints: {}, edges: [] }));
  }, chapter.initialState);
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('開始遊戲');
  await page.locator('#start-button').click();
  expect((await currentJourney(page)).cursor.nodeId).toBe(chapter.startNode);
});

async function seedCom02jJourney(page, nodeId, topic, complete = false) {
  await page.goto('/');
  // HTML load does not await async route bootstrap. Finish mounting before a
  // seeded reload can abort its fetches and report a spurious bootstrap error.
  await expect(page.locator('#start-button')).toBeEnabled();
  const chapter = await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  const stats = { ...chapter.initialState, F_XT: 9, F_JYC: 4, jyc_first_topic: topic };
  const flags = nodeId.startsWith('common_station_cafe_jyc_') ? [] : ['contact_xu','entry-effect:common_package_xu_first_message_06','saved-world'];
  await page.evaluate(({ nodeId, stats, flags, complete }) => {
    const snapshot = { nodeId, stats, flags, returnNodes: [] };
    localStorage.setItem('opening-demo-chapter-01:journey:v2', JSON.stringify({ version: 2, playerDisplayName: '小雨', cursor: snapshot, frontier: snapshot,
      runComplete: complete, checkpoints: { [nodeId]: snapshot }, edges: [] }));
  }, { nodeId, stats, flags, complete });
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  return { chapter, stats, flags };
}

async function playCom02j(page, choiceIndex, variant, stopAt, testInfo) {
  const seen = [];
  let reloaded = false;
  for (let step = 0; step < 75; step++) {
    const journey = await currentJourney(page);
    const id = journey.cursor.nodeId;
    if (id === stopAt) return { seen, reloaded, journey };
    await waitForDialogueReady(page);
    seen.push(id);
    await expect(page.locator('#scene-image')).toHaveAttribute('src', /narrative-preview-v1.webp/);
    await expect.poll(() => page.locator('#scene-image').evaluate(image => image.complete && image.naturalWidth === 1600 && image.naturalHeight === 900)).toBe(true);
    if (id === 'common_station_cafe_jyc_drawing_03') await expect(page.locator('#speaker')).toHaveText('女生');
    if (id === 'common_station_cafe_jyc_names') await expect(page.locator('#dialogue-text')).toHaveText('上次忘了問。我叫 小雨。');
    if (id === 'common_station_cafe_jyc_names_02') await expect(page.locator('#speaker')).toHaveText('江雨澄');
    if (id.startsWith('common_station_cafe_jyc_choice_')) {
      expect(id).toBe(`common_station_cafe_jyc_choice_${variant}`);
      const chapter = await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
      const label = chapter.nodes[`com02j_continue_topic_${variant}`].text;
      await expect(page.locator('#choice-list .choice-button').nth(1)).toContainText(label);
      await testInfo.attach(`com02j-${variant}-choice-${choiceIndex}`, { body: await page.screenshot(), contentType: 'image/png' });
      await page.locator('#choice-list .choice-button').nth(choiceIndex).click();
      const cursor = (await currentJourney(page)).cursor;
      await page.reload();
      await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
      await page.locator('#start-button').click();
      expect((await currentJourney(page)).cursor).toEqual(cursor);
      reloaded = true;
    } else await page.locator('#advance-zone').click();
  }
  throw new Error(`COM02J did not return to ${stopAt}`);
}

for (const [topic, variant, choiceIndex] of [[0,'neutral',1],[1,'worldbuilding',1],[2,'visual_design',1],[3,'edition_value',1],[2,'visual_design',0],[99,'neutral',2]]) {
  test(`COM02J browser topic ${topic} ${variant} choice ${choiceIndex} exact UI, reload and Memory restoration`, async ({ page }, testInfo) => {
    test.setTimeout(150_000);
    const errors = collectBlockingErrors(page);
    const { stats } = await seedCom02jJourney(page,'common_station_cafe_jyc_enter',topic);
    const played = await playCom02j(page,choiceIndex,variant,'common_package_xu_arrive',testInfo);
    expect(played.reloaded).toBe(true);
    expect(played.journey.cursor.stats).toEqual({ ...stats, F_JYC: stats.F_JYC + 1 + Number(choiceIndex === 1), T_JYC: Number(choiceIndex === 0), C_JYC: Number(choiceIndex === 2) });
    expect(played.journey.frontierRank).toBe(200);
    expect(played.journey.cursor.flags).toContain(`jyc_second_topic:${['her_art','shared_work','general_praise'][choiceIndex]}`);
    expect(played.journey.cursor.flags).not.toContain('contact_jyc');
    expect(played.journey.cursor.flags).not.toContain('contact_xu');
    expect(played.seen).toContain('common_station_cafe_jyc_reciprocity_02');
    const world = played.journey.frontier;
    // Force a genuine replay-local sparse history. The deeper world still has topic.
    await page.evaluate(() => {
      const key='opening-demo-chapter-01:journey:v2';const saved=JSON.parse(localStorage.getItem(key));
      saved.checkpoints.common_station_cafe_jyc_enter.stats.jyc_first_topic=0;
      localStorage.setItem(key,JSON.stringify(saved));
    });
    await page.reload();await page.locator('#memories-button').click();
    await expect(page.locator('[data-memory-id="mem.opening.ch1.station-cafe-jyc"]')).toBeEnabled();
    await page.locator('[data-memory-id="mem.opening.ch1.station-cafe-jyc"]').click();
    for (let step=0;step<65 && !await page.locator('#title-screen').isVisible();step++) {
      await waitForDialogueReady(page);
      const id=(await currentJourney(page)).cursor.nodeId;
      if(id.startsWith('common_station_cafe_jyc_choice_')) {
        expect(id).toBe('common_station_cafe_jyc_choice_neutral');
        await page.locator('#choice-list .choice-button').nth(1).click();
      } else await page.locator('#advance-zone').click();
    }
    await expect(page.locator('#title-screen')).toBeVisible();
    expect((await currentJourney(page)).frontier).toEqual(world);
    await page.reload();await page.locator('#start-button').click();
    expect((await currentJourney(page)).cursor).toEqual(world);
    await page.locator('#game-home-button').click();await page.locator('#gallery-button').click();
    expect(await page.locator('#cg-grid img').evaluateAll(images=>images.some(image=>image.src.includes('narrative-preview')))).toBe(false);
    expect(errors).toEqual([]);
  });
}

for (const [nodeId,complete] of [['com03x_preview_complete',true],['common_package_xu_proof_10',false],['common_package_xu_first_message_06',false]]) {
  test(`COM02J browser upgrades ${nodeId} without duplicate effects or lost world state`, async ({ page },testInfo) => {
    test.setTimeout(100_000);
    const errors=collectBlockingErrors(page);
    const { stats,flags }=await seedCom02jJourney(page,nodeId,2,complete);
    const result=await playCom02j(page,2,'visual_design',complete?'common_recommend_discord_jyc_enter':nodeId,testInfo);
    expect(result.reloaded).toBe(true);
    expect(result.journey.cursor.stats).toEqual({...stats,F_JYC:5,C_JYC:1});
    expect(result.journey.cursor.flags).toEqual(expect.arrayContaining([...flags,'preview:com02j-complete']));
    expect(result.journey.playerDisplayName).toBe('小雨');
    expect(result.journey.com02jSupplement).toBeNull();
    expect(result.journey.runComplete).toBe(false);
    await expect(page.locator('#game-shell')).toBeVisible();
    await page.reload();await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
    expect((await currentJourney(page)).com02jSupplement).toBeNull();
    expect((await currentJourney(page)).frontier).toEqual(result.journey.frontier);
    expect(errors).toEqual([]);
  });
}

for(const [closing,variant,history] of [
  [0,'shared_visual_design',['jyc_second_topic:shared_work','history:jyc_first_topic:visual_design']],
  [1,'her_art',['jyc_second_topic:her_art']],
  [2,'neutral',[]]
]) test(`COM03J browser closing ${closing}: old completed Continue, local callback, reload, Memory, final Start`,async({page},testInfo)=>{
  test.setTimeout(240_000);
  const errors=collectBlockingErrors(page),prefix='common_recommend_discord_jyc_';
  await page.goto('/');
  await expect(page.locator('#start-button')).toBeEnabled();
  const chapter=await(await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  const flags=['preview:com02j-complete','entry-effect:common_station_cafe_jyc_complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen','contact_xu','entry-effect:common_package_xu_first_message_06','world-retained',...history];
  const stats={...chapter.initialState,F_XT:9,F_JYC:6,T_JYC:2,C_JYC:3,jyc_first_topic:99};
  await page.evaluate(({flags,stats})=>{
    const snapshot={nodeId:'com03x_preview_complete',stats,flags,returnNodes:[]};
    localStorage.setItem('opening-demo-chapter-01:journey:v2',JSON.stringify({version:2,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,runComplete:true,checkpoints:{[snapshot.nodeId]:snapshot},edges:[]}));
  },{flags,stats});
  await page.reload();await expect(page.locator('#start-button')).toHaveText('繼續遊戲');await page.locator('#start-button').click();
  const seen=[],reloaded=new Set();
  for(let step=0;step<100&&!await page.locator('#ending-screen').isVisible();step++){
    await waitForDialogueReady(page);const journey=await currentJourney(page),id=journey.cursor.nodeId,node=chapter.nodes[id];seen.push(id);
    await expect(page.locator('#scene-image')).toHaveAttribute('src',/narrative-preview-v1.webp/);
    await expect.poll(()=>page.locator('#scene-image').evaluate(i=>i.complete&&i.naturalWidth===1600&&i.naturalHeight===900)).toBe(true);
    await expect(page.locator('#dialogue-text')).toHaveText(node.text);
    if([prefix+'callback_'+variant,prefix+'meme',prefix+'choice',prefix+['continue_close','warm_close','save_for_later'][closing],prefix+'exit'].includes(id)&&!reloaded.has(id)){
      reloaded.add(id);await page.reload();await page.locator('#start-button').click();await waitForDialogueReady(page);expect((await currentJourney(page)).cursor).toEqual(journey.cursor);
    }
    if(node.choices){await page.locator('#advance-zone').click();await expect(page.locator('#dialogue-panel')).not.toBeVisible();await expect(page.locator('#choice-list .choice-button')).toHaveCount(3);await testInfo.attach(`com03j-closing-${closing}`,{body:await page.screenshot(),contentType:'image/png'});await page.locator('#choice-list .choice-button').nth(closing).click();}
    else await page.locator('#advance-zone').click();
  }
  await expect(page.locator('#ending-screen')).toBeVisible();expect(reloaded.size).toBe(5);expect(seen.filter(id=>/^common_recommend_discord_jyc_callback_[a-z_]+$/.test(id))).toEqual([prefix+'callback_'+variant]);
  const finished=await currentJourney(page);expect(finished.cursor.nodeId).toBe('com03j_preview_complete');expect(finished.cursor.stats).toEqual({...stats,F_JYC:7});expect(finished.cursor.flags).toEqual(expect.arrayContaining([...flags,'contact_jyc','preview:com03j-complete','jyc_com03j_reply_style:'+['continue_content','warm_close','save_for_later'][closing]]));expect(finished.runComplete).toBe(true);expect(finished.frontierRank).toBe(220);
  await page.locator('#home-button').click();await expect(page.locator('#start-button')).toHaveText('開始遊戲');
  // The replay entry intentionally has unknown history while the live frontier retains its own facts.
  await page.evaluate(({prefix,closing})=>{
    const key='opening-demo-chapter-01:journey:v2',saved=JSON.parse(localStorage.getItem(key));
    if(closing===0) delete saved.checkpoints[prefix+'enter'];
    else saved.checkpoints[prefix+'enter'].flags=saved.checkpoints[prefix+'enter'].flags.filter(f=>!f.startsWith('jyc_second_topic:')&&!f.startsWith('history:jyc_first_topic:'));
    localStorage.setItem(key,JSON.stringify(saved));
  },{prefix,closing});
  await page.reload();const beforeReplay=await currentJourney(page);await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]')).toBeEnabled();await page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]').click();
  let replayCallback,localReload=false;
  for(let step=0;step<100&&!await page.locator('#memories-screen').isVisible();step++){
    await waitForDialogueReady(page);const journey=await currentJourney(page),id=journey.cursor.nodeId,node=chapter.nodes[id];
    if(/^common_recommend_discord_jyc_callback_[a-z_]+$/.test(id))replayCallback=id;
    if(id===prefix+'meme'&&!localReload){await page.reload();await page.locator('#start-button').click();await waitForDialogueReady(page);expect((await currentJourney(page)).cursor).toEqual(journey.cursor);localReload=true;}
    if(node.choices){await page.locator('#advance-zone').click();await page.locator('#choice-list .choice-button').nth((closing+1)%3).click();}else await page.locator('#advance-zone').click();
  }
  await expect(page.locator('#memories-screen')).toBeVisible();expect(replayCallback).toBe(prefix+'callback_neutral');expect(localReload).toBe(true);
  const afterReplay=await currentJourney(page);expect(afterReplay.frontier).toEqual(beforeReplay.frontier);expect(afterReplay.cursor).toEqual(beforeReplay.cursor);expect(afterReplay.checkpoints).toEqual(beforeReplay.checkpoints);expect(afterReplay.edges).toEqual(beforeReplay.edges);expect(afterReplay.runComplete).toBe(true);expect(afterReplay.com03jReplay).toBeNull();
  await page.locator('#memories-back').click();await page.locator('#gallery-button').click();expect(await page.locator('#cg-grid img').evaluateAll(images=>images.some(i=>i.src.includes('narrative-preview')))).toBe(false);await page.locator('#gallery-back').click();
  await page.locator('#start-button').click();expect((await currentJourney(page)).cursor.nodeId).toBe(chapter.startNode);expect((await currentJourney(page)).cursor.stats.F_JYC).toBe(0);
  if(closing===0){
    const fresh=await currentJourney(page);expect(fresh.restartActive).toBe(true);await page.locator('#game-memories-button').click();await page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]').click();
    let freshReplayReload=false;
    for(let step=0;step<100&&!await page.locator('#memories-screen').isVisible();step++){
      await waitForDialogueReady(page);const journey=await currentJourney(page),id=journey.cursor.nodeId,node=chapter.nodes[id];
      if(id===prefix+'meme'&&!freshReplayReload){await page.reload();await page.locator('#start-button').click();await waitForDialogueReady(page);expect((await currentJourney(page)).cursor).toEqual(journey.cursor);freshReplayReload=true;}
      if(node.choices){await page.locator('#advance-zone').click();await page.locator('#choice-list .choice-button').nth(1).click();}else await page.locator('#advance-zone').click();
    }
    await expect(page.locator('#memories-screen')).toBeVisible();const restored=await currentJourney(page);expect(freshReplayReload).toBe(true);expect(restored.cursor).toEqual(fresh.cursor);expect(restored.frontier).toEqual(fresh.frontier);expect(restored.checkpoints).toEqual(fresh.checkpoints);expect(restored.restartActive).toBe(true);expect(restored.runComplete).toBe(false);
    await page.locator('#memories-back').click();await page.reload();await page.locator('#start-button').click();expect((await currentJourney(page)).cursor).toEqual(fresh.cursor);expect((await currentJourney(page)).restartActive).toBe(true);
  }
  await testInfo.attach(`com03j-closing-${closing}-evidence`,{body:Buffer.from(JSON.stringify({seen,reloads:[...reloaded],finished,replayCallback,localReload,errors})),contentType:'application/json'});expect(errors).toEqual([]);
});
