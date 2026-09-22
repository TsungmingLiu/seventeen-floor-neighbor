import { GameEngine } from './engine.js?v=64605492fc64';

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
    const [assetManifest, chapter, sceneLibrary] = await Promise.all([
      fetchJson(`${base}/assets.json`), fetchJson(`${base}/chapter.json`), fetchJson(`${base}/scenes.json`)
    ]);
    document.title = chapter.title;
    document.querySelector('#title-prefix').textContent = route.titlePrefix || '17樓的';
    document.querySelector('#title-main').textContent = route.titleMain || '新鄰居';
    const engine = new GameEngine({ chapter, assetManifest, sceneLibrary });
    engine.mount();
  } catch (error) {
    console.error(error);
    startButton.disabled = true;
    startButton.textContent = '載入失敗，請重新整理';
  }
}

bootstrap();
