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
  if (id === 'common_convenience_xu_checkout_14' || /^common_convenience_xu_exit(?:_|$)/.test(id)) return 'apartment-elevator.webp';
  return 'com02x-bg-01-v1.webp';
}

async function currentJourney(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
}

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
    test.setTimeout(180_000);
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
        const expectedPath = expected === 'apartment-elevator.webp' ? apartmentPath : `/assets/opening-ch1-demo/${expected}`;
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
    await expect(page.locator('#ending-screen')).toBeVisible();
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
    expect(finished.runComplete).toBe(true);
    await page.locator('#home-button').click();
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

test('opening preview plays COM-00 → COM-01X → COM-01J → COM-02X and saves its shared exit', async ({ page }) => {
  test.setTimeout(180_000); // Full-story traversal includes the real typewriter animation.
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
      'mem.opening.ch1.acg-first-meet', 'mem.opening.ch1.convenience-xu'
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
    expect((await currentJourney(page)).cursor.nodeId).toBe('common_package_xu_arrive');
    expect((await currentJourney(page)).cursor.stats).toEqual(stats);
    const seen = new Set();
    let reloaded = false;
    let memoryChecked = false;
    for (let step = 0; step < 110; step += 1) {
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
        // This sparse historical save unlocks movein + convenience; the UI also shows
        // the first locked event, and hides later locked events in the same section.
        await expect(page.locator('.memory-card')).toHaveCount(3);
        expect(await page.locator('.memory-card').evaluateAll(cards => cards.map(card => card.dataset.memoryId)))
          .toEqual(['mem.opening.ch1.movein', 'mem.opening.ch1.elevator-restart', 'mem.opening.ch1.convenience-xu']);
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
        await page.locator('#advance-zone').click();
        await expect(page.locator('#choice-list')).toBeVisible();
        await page.locator('#choice-list .choice-button').nth(branchIndex).click();
      } else await page.locator('#advance-zone').click();
    }
    await expect(page.locator('#ending-screen')).toBeVisible();
    expect(reloaded).toBe(true);
    expect(memoryChecked).toBe(true);
    for (const id of ['common_package_xu_proof', 'common_package_xu_callback', 'common_package_xu_line', 'common_package_xu_exit', 'common_package_xu_first_message']) expect(seen.has(id)).toBe(true);
    const finished = await currentJourney(page);
    expect(finished.cursor.nodeId).toBe('com03x_preview_complete');
    expect(finished.cursor.stats).toEqual({ ...stats, F_XT: 8, [tone]: stats[tone] + 1 });
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
