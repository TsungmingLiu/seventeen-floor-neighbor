import { GameEngine } from './engine.js?v=c3f8cde6d47c';

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

async function bootstrap() {
  const startButton = document.querySelector('#start-button');
  try {
    const index = await fetchJson('content/routes/index.json');
    const route = index.routes.find(candidate => candidate.id === index.defaultRoute);
    if (!route) throw new Error('No playable story configured');
    const base = `content/routes/${route.id}`;
    const [assetManifest, chapter, sceneLibrary, memoryLibrary] = await Promise.all([
      fetchJson(`${base}/assets.json`),
      fetchJson(`${base}/chapter.json`),
      fetchJson(`${base}/scenes.json`),
      fetchJson(`${base}/memories.json`)
    ]);
    document.title = chapter.title;
    document.querySelector('#title-prefix').textContent = route.titlePrefix || '17樓的';
    document.querySelector('#title-main').textContent = route.titleMain || '新鄰居';
    document.querySelector('#title-eyebrow').textContent = route.eyebrow || '第一人稱互動戀愛故事';
    document.querySelector('#title-premise').textContent = route.premise || '';
    document.querySelector('#title-hint').textContent = route.hint || '';
    const engine = new GameEngine({ chapter, assetManifest, sceneLibrary, memoryLibrary });
    engine.mount();
  } catch (error) {
    console.error(error);
    startButton.disabled = true;
    startButton.textContent = '載入失敗，請重新整理';
  }
}

bootstrap();
