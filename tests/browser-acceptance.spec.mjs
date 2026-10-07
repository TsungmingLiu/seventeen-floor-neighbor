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

async function currentJourney(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
}

test('unfinished first scene keeps its unknown continuation in Memories', async ({ page }) => {
  const errors = collectBlockingErrors(page);
  await page.goto('/');
  await page.locator('#start-button').click();
  await enterPlayerName(page);
  await waitForDialogueReady(page);
  await page.locator('#advance-zone').click();
  await waitForDialogueReady(page);
  const before = await currentJourney(page);
  expect(before.cursor.nodeId).toBe('common_movein_rain_open_chair');
  await page.locator('#game-memories-button').click();
  await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'flow');
  const next = page.locator('[data-group-id="elevator"]');
  await expect(next).toBeDisabled();
  await expect(next.locator('strong')).toHaveText('???');
  await expect(page.locator('.story-map-lines path[data-from="movein"][data-to="elevator"]')).toHaveClass(/is-unexplored/);
  await expect(page.locator('.story-map-lines text')).toHaveCount(0);
  await expect(page.locator('[data-group-id="weekend"]')).toHaveCount(0);
  await page.locator('[data-group-id="movein"]').click();
  await expect(page.locator('#story-inspector .story-continuation')).toHaveCount(0);
  expect(await currentJourney(page)).toEqual(before);
  expect(errors).toEqual([]);
});

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
  const discordCard = page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]');
  await expect(discordCard).toBeVisible();
  await expect(discordCard).toBeDisabled();
  await expect(discordCard.locator('strong')).toHaveText('???');
  expect((await currentJourney(page)).checkpoints).not.toHaveProperty(library.events[6].replayNode);
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
  test(`COM-02X ${branch} weekend preview reload uses placeholder and preserves work transition`, async ({page}) => {
    test.setTimeout(180_000);
    const errors=collectBlockingErrors(page);
    await seed(page,'common_convenience_xu_enter',{met_xu_tang:1},['history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip']);
    await follow(page,'common_weekday_outing_work',{'common_convenience_xu_choice_home':`com02x_${branch}`});
    expect((await journey(page)).cursor.flags).toContain('preview:com02x-complete');
    expect((await journey(page)).frontierRank).toBe(170);
    await expect(page.locator('#scene-image')).toHaveAttribute('src',/narrative-preview-v1.webp/);
    const before=await journey(page);await page.reload();await page.locator('#start-button').click();
    expect((await journey(page)).cursor).toEqual(before.cursor);
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
  await page.locator('#story-inspector .story-replay').click();
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
  await page.locator('#story-inspector .story-replay').click();
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

async function journey(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('opening-demo-chapter-01:journey:v2')));
}
async function advanceWithKeyboard(page) {
  await page.locator('#advance-zone').focus();
  await page.keyboard.press('Space');
}
async function ready(page) {
  // Typing can finish between reading the hint and sending Space. Readiness
  // must not advance the cursor before follow() records the next dialogue.
  await expect.poll(async () => /點擊繼續|點擊選擇/.test(await page.locator('#advance-hint').textContent() || '')
    || await page.locator('#choice-list').isVisible(), { timeout: 8000, intervals: [50, 100] }).toBe(true);
}
async function seed(page,nodeId,stats={},flags=[]) {
  await page.goto('/');
  await expect(page.locator('#start-button')).toBeEnabled();
  const chapter=await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  const snapshot={nodeId,stats:{...chapter.initialState,...stats},flags,returnNodes:[]};
  await page.evaluate(snapshot=>localStorage.setItem('opening-demo-chapter-01:journey:v2',JSON.stringify({version:2,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,runComplete:false,checkpoints:{[snapshot.nodeId]:snapshot},edges:[]})),snapshot);
  await page.reload();
  await expect(page.locator('#start-button')).toHaveText('繼續遊戲');
  await page.locator('#start-button').click();
  return chapter;
}
async function follow(page,stop,choices={},limit=260) {
  const seen=[];
  const chapter=await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  for(let step=0;step<limit;step++) {
    const current=await journey(page);
    const id=current.cursor?.nodeId;
    seen.push(id);
    if(id===stop) return seen;
    if(await page.locator('#ending-screen').isVisible()) throw new Error(`Reached ${id} before ${stop}`);
    await ready(page);
    const node=chapter.nodes[id];
    if(node.choices) {
      if(!await page.locator('#choice-list').isVisible()) await advanceWithKeyboard(page);
      const wanted=choices[id]??node.choices[0].id;
      const index=node.choices.findIndex(choice=>choice.id===wanted);
      expect(index,`${id}: ${wanted}`).toBeGreaterThanOrEqual(0);
      await page.locator('#choice-list .choice-button').nth(index).click();
    } else await advanceWithKeyboard(page);
    await expect.poll(async()=>(await journey(page)).cursor?.nodeId,{timeout:8000,intervals:[50,100]}).not.toBe(id);
  }
  throw new Error(`Did not reach ${stop}; stopped at ${(await journey(page)).cursor?.nodeId}`);
}

test('bookstore and cafe skips keep Jiang unseen and avoid shop art',async({page})=>{
  test.setTimeout(120_000);
  await seed(page,'common_bookstore_bridge_weekend_decision_frame',{met_xu_tang:1});
  const seen=await follow(page,'common_package_xu_arrive',{
    common_bookstore_bridge_weekend_decision:'com01b_bookstore_skip',
    common_weekday_outing_decision:'com01b_weekday_street_walk'
  },220);
  expect(seen).not.toContain('common_acg_first_meet_enter');
  expect(seen).not.toContain('common_station_cafe_jyc_first_enter');
  const saved=await journey(page);
  expect(saved.cursor.stats.met_jiang_yucheng).toBe(0);
  expect(saved.cursor.flags).not.toContain('contact_jyc');
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.acg-first-meet"]')).toHaveCount(0);
  await expect(page.locator('[data-memory-id="mem.opening.ch1.first-cafe-jyc"]')).toHaveCount(0);
});

test('bookstore-skip cafe first meeting and refusal unlock only the truthful Memory',async({page})=>{
  test.setTimeout(180_000);
  await seed(page,'common_bookstore_bridge_weekend_decision_frame',{met_xu_tang:1});
  const seen=await follow(page,'common_package_xu_arrive',{
    common_bookstore_bridge_weekend_decision:'com01b_bookstore_skip',
    common_weekday_outing_decision:'com01b_weekday_cafe_first',
    common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'
  },260);
  expect(seen).toContain('common_station_cafe_jyc_first_enter');
  expect(seen).not.toContain('common_station_cafe_jyc_enter');
  expect((await journey(page)).cursor.flags).not.toContain('contact_jyc');
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.first-cafe-jyc"]')).toBeEnabled();
  await expect(page.locator('[data-memory-id="mem.opening.ch1.station-cafe-jyc"]')).toHaveCount(0);
  await expect(page.locator('[data-memory-id="mem.opening.ch1.recommend-discord-jyc"]')).toHaveCount(0);
});

test('contacted week continues to a Jiang first outing after the confirmed first-window plan',async({page})=>{
  test.setTimeout(240_000);
  const chapter=await seed(page,'COM03M-S01',{met_xu_tang:1,met_jiang_yucheng:1},['contact_xu','contact_jyc','jyc_com03j_reply_style:warm_close','preview:com02j-complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen']);
  const seen=await follow(page,'COM03M-J01-warm_close');
  await ready(page);
  await expect(page.locator('#dialogue-text')).toHaveText(chapter.nodes['COM03M-J01-warm_close'].text);
  const callback=await journey(page);
  expect(callback.cursor.nodeId).toBe('COM03M-J01-warm_close');
  expect(callback.cursor.flags).toEqual(expect.arrayContaining(['contact_xu','contact_jyc','jyc_com03j_reply_style:warm_close']));
  expect(callback.checkpoints['COM03M-J01-warm_close']).toEqual(callback.cursor);
  expect(callback.checkpoints).not.toHaveProperty('COM03M-J01-neutral');
  expect(callback.edges).toContainEqual(['COM03M-J01','COM03M-J01-warm_close']);
  seen.push(...await follow(page,'JYC-05-ENTRY',{
    'COM03M-C01':'COM03M-C01-J',
    'OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-J',
    'OPEN-A-J-TIME':'OPEN-A-J-ACCEPT'
  },210));
  expect(seen).toContain('COM03M-S01');
  expect(seen).toContain('COM03M-J01-warm_close');
  expect(seen).toContain('COM03M-S06');
  expect(seen).toContain('OPEN-A-ENTRY');
  expect(seen).not.toContain('OPEN-A-X-START-INCOMING');
  const saved=await journey(page);
  expect(saved.cursor.nodeId).toBe('JYC-05-ENTRY');
  expect(saved.cursor.flags).toEqual(expect.arrayContaining(['open_dating_unlocked','open_a_entered']));
  expect(saved.cursor.flags).not.toContain('open_a_window1_consumed');
  await page.reload();
  expect((await journey(page)).cursor).toEqual(saved.cursor);
  await page.locator('#gallery-button').click();
  expect(await page.locator('#cg-grid img').evaluateAll(images=>images.some(image=>image.src.includes('narrative-preview')))).toBe(false);
});

test('scene inspection, layout and development review never change the saved journey', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-button').click();
  await enterPlayerName(page, '小雨');
  await waitForDialogueReady(page);
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  const before = await currentJourney(page);
  await expect(page.locator('[data-group-id="cafe"]')).toHaveCount(0);
  await page.locator('[data-group-id="movein"]').click();
  await expect(page.locator('#story-inspector')).toBeVisible();
  await expect(page.locator('#story-inspector')).not.toContainText('江雨澄');
  await expect(page.locator('#story-inspector .story-choice')).toHaveCount(0);
  await page.locator('.story-inspector-close').click();
  await expect(page.locator('#story-map-controls button')).toHaveCount(0);
  await expect(page.locator('#memory-filters')).not.toContainText('心動');
  await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'flow');
  await page.locator('#memory-filters button').filter({ hasText: '許棠' }).click();
  await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'list');
  await page.locator('#memory-filters button').filter({ hasText: '全部' }).click();
  await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'flow');
  const reviewToggle = page.locator('#story-review-toggle');
  if (await reviewToggle.count()) {
    await expect(reviewToggle).toBeAttached();
    expect(await reviewToggle.evaluate(el => el.closest('#memory-filters') !== null)).toBe(true);
    await reviewToggle.check();
    await page.locator('#memory-filters button').filter({ hasText: '江雨澄' }).click();
    await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'list');
    await page.locator('#memory-filters button').filter({ hasText: '全部' }).click();
    await expect(page.locator('#memory-list')).toHaveAttribute('data-layout', 'flow');
    await page.locator('[data-group-id="cafe"]').click();
    await expect(page.locator('#story-inspector .story-variant-tabs button')).toHaveCount(2);
    await expect(page.locator('#story-inspector .story-condition')).toContainText('曾在書店認識雨澄');
    await page.locator('#story-inspector .story-variant-tabs button').filter({ hasText: 'B・初遇' }).click();
    await expect(page.locator('#story-inspector .story-condition')).toContainText('尚未解鎖書店初遇');
    await expect(page.locator('#story-inspector')).toContainText('現有完整劇本與選項');
    await expect(page.locator('#story-inspector')).not.toContainText('legacy:disabled');
    await expect(page.locator('#story-inspector .story-replay')).toHaveCount(0);
    await expect(page.locator('#story-inspector .story-script')).toContainText('旁白');
    await page.locator('.story-inspector-close').click();
    await reviewToggle.uncheck();
    await expect(page.locator('[data-group-id="cafe"]')).toHaveCount(0);
  }
  expect(await currentJourney(page)).toEqual(before);
});

for (const path of ['A','B','C']) {
 test(`weekend-weekday path ${path} runs to its saved review boundary`,async({page})=>{
  test.setTimeout(240_000);const errors=collectBlockingErrors(page);
  await seed(page,'common_bookstore_bridge_weekend_decision_frame',{met_xu_tang:1});
  const seen=await follow(page,'OPEN-A-ENTRY-SOLO',{
   common_bookstore_bridge_weekend_decision:path==='A'?'com01b_bookstore_go':'com01b_bookstore_skip',
   common_weekday_outing_decision:path==='C'?'com01b_weekday_street_walk':'com01b_weekday_cafe_first',
   'OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-LIFE','OPEN-A-ENTRY-ACTION-X':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-SOLO'
  },450);
  expect(seen.indexOf('common_convenience_xu_enter')).toBeLessThan(seen.indexOf('common_weekday_outing_work'));
  const saved=await journey(page);expect(saved.cursor.flags.includes('jyc_permanently_excluded')).toBe(path==='C');
  if(path==='C')expect(seen.some(id=>/acg_first_meet|cafe_jyc|discord_jyc|COM03M-J(?!.*GATE)|OPEN-A-J/.test(id))).toBe(false);
  await page.reload();expect((await journey(page)).cursor).toEqual(saved.cursor);expect(errors).toEqual([]);
 });
}
test('stale contact cannot reopen Jiang after the irreversible street choice',async({page})=>{
 test.setTimeout(180_000);const errors=collectBlockingErrors(page);
 await seed(page,'common_weekday_outing_street_return',{},['jyc_permanently_excluded','contact_xu','contact_jyc','preview:com02j-complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen']);
 const seen=await follow(page,'OPEN-A-ENTRY-SOLO',{'OPEN-A-ENTRY-ACTION-X':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-SOLO'},300);
 expect(seen.some(id=>/discord_jyc|COM03M-J(?!.*GATE)|COM03M-BJ|OPEN-A-J/.test(id))).toBe(false);
 expect((await journey(page)).cursor.flags).toContain('jyc_permanently_excluded');expect(errors).toEqual([]);
});

async function inspectCafe(page) {
  await page.locator(await page.locator('#ending-screen').isVisible() ? '#home-button' : '#game-home-button').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-group-id="cafe"]').click();
}
async function replayScene(page, group) {
  await page.locator('.story-inspector-close').click();
  await page.locator(`[data-group-id="${group}"]`).click();
  await page.locator('#story-inspector .story-replay').click();
}
test('actual cafe-only B archive stays B after earned bookstore replay and future GAME chooses A', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = collectBlockingErrors(page);
  const chapter = await seed(page, 'common_bookstore_bridge_weekend_decision_frame', { met_xu_tang: 1 });
  await follow(page, 'OPEN-A-ENTRY-SOLO', {
    common_bookstore_bridge_weekend_decision: 'com01b_bookstore_skip',
    common_weekday_outing_decision: 'com01b_weekday_cafe_first',
    common_station_cafe_jyc_contact_choice: 'com02j_leave_without_contact',
    'OPEN-A-ENTRY-ACTION-X': 'OPEN-A-ACT-LIFE', 'OPEN-A-LIFE-ACTION': 'OPEN-A-LIFE-SOLO'
  }, 450);
  const main = (await journey(page)).frontier;
  expect((await journey(page)).bookstoreEverEarned).toBe(false);
  expect((await journey(page)).initialEncounterEverEarned).toBe(true);
  await inspectCafe(page);
  await expect(page.locator('#story-inspector .story-variant-tabs button')).toHaveCount(0);
  await expect(page.locator('#story-inspector .story-script')).toContainText(chapter.nodes.common_station_cafe_jyc_first_drawing_02.text);
  await expect(page.locator('#story-inspector .story-script')).not.toContainText(chapter.nodes.common_station_cafe_jyc_drawing_03.text);
  const archivedB = await page.locator('#story-inspector .story-script').textContent();
  await page.locator('#story-inspector .story-replay').click();
  expect((await journey(page)).cursor.nodeId).toBe('common_station_cafe_jyc_first_enter');
  await inspectCafe(page);
  await replayScene(page, 'weekend');
  await follow(page, 'common_convenience_xu_enter', { common_bookstore_bridge_weekend_decision: 'com01b_bookstore_go' });
  expect((await journey(page)).bookstoreEverEarned).toBe(true);
  await inspectCafe(page);
  await expect(page.locator('#story-inspector .story-variant-tabs button')).toHaveCount(0);
  expect(await page.locator('#story-inspector .story-script').textContent()).toBe(archivedB);
  await page.locator('#story-inspector .story-replay').click();
  const restored = await journey(page);
  expect(restored.cursor.nodeId).toBe('common_station_cafe_jyc_enter_02');
  expect(restored.cursor.stats.met_jiang_yucheng).toBe(0);
  expect(restored.cursor.flags).not.toContain('weekend_book_purchased');
  expect(restored.cursor.flags).not.toContain('contact_jyc');
  expect(restored.frontier).toEqual(main);
  await follow(page, 'common_station_cafe_jyc_first_drawing_05');
  expect((await journey(page)).cursor.flags).toContain('history:cafe-bookstore-reunion');
  await inspectCafe(page);
  await expect(page.locator('#story-inspector .story-variant-tabs button')).toHaveCount(2);
  await expect(page.locator('#story-inspector .story-script')).toContainText(chapter.nodes.common_station_cafe_jyc_drawing_03.text);
  await expect(page.locator('#story-inspector .story-script')).not.toContainText(chapter.nodes.common_station_cafe_jyc_first_drawing_02.text);
  await page.locator('#story-inspector .story-variant-tabs button').filter({ hasText: 'B' }).click();
  await expect(page.locator('#story-inspector .story-script')).toContainText(chapter.nodes.common_station_cafe_jyc_first_drawing_02.text);
  await expect(page.locator('#story-inspector .story-script')).not.toContainText(chapter.nodes.common_station_cafe_jyc_drawing_03.text);
  await page.reload();
  expect((await journey(page)).frontier).toEqual(main);
  await page.locator('#start-button').click();
  expect((await journey(page)).cursor.nodeId).toBe(main.nodeId);
  expect(errors).toEqual([]);
});
test('bookstore earned elsewhere with restored local met zero shows only genuine A despite shared B neutral nodes', async ({ page }) => {
  test.setTimeout(240_000);
  const chapter = await seed(page, 'common_bookstore_bridge_weekend_decision_frame', { met_xu_tang: 1 });
  await follow(page, 'common_package_xu_arrive', {
    common_bookstore_bridge_weekend_decision: 'com01b_bookstore_skip',
    common_weekday_outing_decision: 'com01b_weekday_street_walk'
  });
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-group-id="weekend"]').click();
  await page.locator('#story-inspector .story-replay').click();
  await follow(page, 'common_convenience_xu_enter', { common_bookstore_bridge_weekend_decision: 'com01b_bookstore_go' });
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-group-id="weekday"]').click();
  await page.locator('#story-inspector .story-replay').click();
  await follow(page, 'common_station_cafe_jyc_first_drawing_05');
  const saved = await journey(page);
  expect(saved.bookstoreEverEarned).toBe(true);
  expect(saved.cursor.flags).toContain('history:cafe-bookstore-reunion');
  expect(saved.cursor.flags).not.toContain('weekend_book_purchased');
  expect(saved.checkpoints).not.toHaveProperty('common_station_cafe_jyc_first_enter');
  expect(saved.checkpoints.common_station_cafe_jyc_enter_02.stats.met_jiang_yucheng).toBe(0);
  await inspectCafe(page);
  await expect(page.locator('#story-inspector .story-variant-tabs button')).toHaveCount(0);
  await expect(page.locator('#story-inspector .story-script')).toContainText(chapter.nodes.common_station_cafe_jyc_drawing_03.text);
  await expect(page.locator('#story-inspector .story-script')).not.toContainText(chapter.nodes.common_station_cafe_jyc_first_drawing_02.text);
});

test('actual remote Xu speaker label is shared by GAME and player/review DETAIL', async ({ page }) => {
  await seed(page, 'common_package_xu_first_message_02', { met_xu_tang: 1 });
  await expect(page.locator('#speaker')).toHaveText('Line-許棠');
  await page.locator('#game-home-button').click();
  await page.locator('#memories-button').click();
  await page.locator('[data-group-id="parcel"]').click();
  await expect(page.locator('#story-inspector .story-script b')).toHaveText('Line-許棠　');
  await page.locator('.story-inspector-close').click();
  const review = page.locator('#story-review-toggle');
  if (await review.count()) {
    await review.check();
    await page.locator('[data-group-id="parcel"]').click();
    await expect(page.locator('#story-inspector .story-script')).toContainText('Line-許棠');
  }
});

for (const [outing, entry, stop, choices] of [
  ['xt04','XT-04-ARRIVE','XT-04-COMPLETED-PREVIEW-STOP',{'XT-04-PACE':'xt-04-ask-plan','XT-04-SCHEDULE-ACTION':'xt-04-impose'}],
  ['jyc05','JYC-05-ENTRY','JYC-05-COMPLETED-PREVIEW-STOP',{'JYC-05-SUPPORT':'jyc-05-answer'}]
]) test(`C1 ${outing} old pending Continue, unresolved completion and reload`, async ({page})=>{
  test.setTimeout(240_000);
  await page.goto('/');await expect(page.locator('#start-button')).toBeEnabled();
  const chapter=await (await page.request.get('/content/routes/opening-demo/chapter.json')).json();
  const snapshot={nodeId:`OPEN-A-ENTRY-PENDING-${outing==='xt04'?'X':'J'}`,stats:{...chapter.initialState,met_xu_tang:1,met_jiang_yucheng:1},returnNodes:[],flags:[
    'contact_xu','contact_jyc','open_a_entered',`open_a_entry_outcome:pending_${outing==='xt04'?'xu':'jyc'}`,
    'preview:com02j-complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen','jyc_com03j_reply_style:warm_close'
  ]};
  await page.evaluate(snapshot=>localStorage.setItem('opening-demo-chapter-01:journey:v2',JSON.stringify({version:2,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,runComplete:true,checkpoints:{[snapshot.nodeId]:snapshot},edges:[]})),snapshot);
  await page.reload();await page.locator('#start-button').click();
  expect((await journey(page)).cursor.nodeId).toBe(entry);
  expect((await journey(page)).cursor.flags).not.toContain('open_a_window1_consumed');
  await follow(page,stop,choices,180);
  const complete=await journey(page);
  expect(complete.frontier.flags).toContain(`open_a_window1_completed:${outing}`);
  expect(complete.frontier.flags).toContain('open_a_window1_consumed');
  expect(complete.frontier.flags).toContain(outing==='xt04'?'xt04_pace_outcome:unresolved_imposed_plan':'jyc05_support_outcome:answered_for_her');
  await page.reload();await expect(page.locator('#start-button')).toHaveText('繼續遊戲');await page.locator('#start-button').click();
  expect((await journey(page)).frontier).toEqual(complete.frontier);
  await expect(page.locator('#ending-screen')).toBeVisible();
});
