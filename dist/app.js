import { GameEngine } from './engine.js';

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

async function bootstrap() {
  const startButton = document.querySelector('#start-button');
  try {
    const [assetManifest, chapter] = await Promise.all([
      fetchJson('content/assets.json'),
      fetchJson('content/chapter-01.json')
    ]);
    const engine = new GameEngine({ chapter, assetManifest });
    engine.mount();
  } catch (error) {
    console.error(error);
    startButton.disabled = true;
    startButton.textContent = '載入失敗，請重新整理';
  }
}

bootstrap();
