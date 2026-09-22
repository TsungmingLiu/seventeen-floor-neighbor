// The title preview and story resolve exactly the same asset IDs and framing.
export const FALLBACK_ART = 'assets/unavailable.svg';

export function resolveVisual(visual, assets) {
  if (!visual) return { id: '', src: FALLBACK_ART, focus: { x: 50, y: 50 }, sprites: [], effects: {} };
  const id = visual.mode === 'composite' ? visual.background : visual.asset;
  const asset = assets[id] || {};
  return {
    id, src: visual.mode === 'cinematic' ? asset.poster : asset.src,
    focus: visual.focus || asset.focus || { x: 55, y: 42 },
    sprites: visual.mode === 'composite' ? (visual.sprites || []) : [],
    effects: visual.effects || {}
  };
}

export function setImage(image, src, focus = { x: 55, y: 42 }) {
  image.onerror = () => {
    image.onerror = null;
    image.src = FALLBACK_ART;
    image.classList.add('is-loaded');
  };
  image.src = src || FALLBACK_ART;
  image.style.setProperty('--focus-x', `${focus.x}%`);
  image.style.setProperty('--focus-y', `${focus.y}%`);
  image.style.objectPosition = `${focus.x}% ${focus.y}%`;
}

export function paintSprites(layer, sprites, assets) {
  layer.replaceChildren();
  for (const spec of sprites) {
    const image = document.createElement('img');
    image.className = `character-image position-${spec.position || 'right'} is-visible`;
    image.alt = '';
    image.dataset.assetId = spec.asset;
    setImage(image, assets[spec.asset]?.src);
    layer.append(image);
  }
}

export function paintPreview(image, layer, visual, assets) {
  const resolved = resolveVisual(visual, assets);
  setImage(image, resolved.src, resolved.focus);
  image.classList.toggle('is-dark', !!resolved.effects.dark);
  paintSprites(layer, resolved.sprites, assets);
}
