const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const recorded = (value) => value === undefined || value === null || value === '' ? 'UNRECORDED' : value;
const text = (value) => esc(recorded(value));
const list = (values, empty = 'UNRECORDED') => Array.isArray(values) && values.length
  ? `<ul>${values.map((item) => `<li>${text(item)}</li>`).join('')}</ul>`
  : `<p class="empty">${esc(empty)}</p>`;
const readable = (value) => Array.isArray(value) ? (value.length ? value.map((v) => esc(v)).join('<br>') : 'UNRECORDED') : text(value);
const field = (label, value) => `<div class="field"><dt>${esc(label)}</dt><dd>${text(value)}</dd></div>`;

function stateCard(label, state) {
  const s = state && typeof state === 'object' ? state : {};
  const relationships = Array.isArray(s.relationships) ? s.relationships : [];
  const knowledge = Array.isArray(s.knowledge) ? s.knowledge : [];
  return `<section class="subcard"><h3>${esc(label)}</h3>
    <h4>Relationships</h4>${relationships.length ? `<ul>${relationships.map((r) => `<li><strong>${text(r?.subject)}</strong> → <strong>${text(r?.toward)}</strong>: ${text(r?.label)} <div class="muted">Constraints: ${readable(r?.constraints)}</div></li>`).join('')}</ul>` : '<p class="empty">UNRECORDED</p>'}
    <h4>Knowledge</h4>${knowledge.length ? `<ul>${knowledge.map((k) => `<li><strong>${text(k?.holder)}</strong><div>Knows: ${readable(k?.knows)}</div><div>Does not know: ${readable(k?.does_not_know)}</div></li>`).join('')}</ul>` : '<p class="empty">UNRECORDED</p>'}
    <h4>Constraints</h4>${list(s.constraints)}</section>`;
}

/** Render a production review as self-contained, read-only HTML. */
export function renderProductionReview(model) {
  const m = model && typeof model === 'object' ? model : {};
  const scene = m.scene && typeof m.scene === 'object' ? m.scene : {};
  const production = m.production && typeof m.production === 'object' ? m.production : {};
  const runtime = m.runtime && typeof m.runtime === 'object' ? m.runtime : {};
  const memory = runtime.memory && typeof runtime.memory === 'object' ? runtime.memory : {};
  const provenance = m.provenance && typeof m.provenance === 'object' ? m.provenance : {};
  const visuals = Array.isArray(m.visuals) ? m.visuals : [];
  const choices = Array.isArray(m.choices) ? m.choices : [];
  const bindings = Array.isArray(runtime.nodeBindings) ? runtime.nodeBindings : [];
  const nextScenes = Array.isArray(runtime.nextScenes) ? runtime.nextScenes : [];
  const sources = Array.isArray(provenance.sources) ? provenance.sources : [];

  const visualHtml = visuals.length ? visuals.map((v) => {
    const image = typeof v?.thumbnailDataUrl === 'string' && /^data:image\/webp;base64,[A-Za-z0-9+/]*={0,2}$/.test(v.thumbnailDataUrl)
      ? `<img src="${esc(v.thumbnailDataUrl)}" alt="Thumbnail for ${text(v?.logicalId)}">`
      : '<div class="thumbnail-placeholder">UNRECORDED thumbnail</div>';
    const camera = v?.camera && typeof v.camera === 'object' ? v.camera : {};
    return `<article class="visual-card">${image}<div class="visual-copy"><h3>${text(v?.logicalId)}</h3><dl>${field('Entry ID', v?.entryId)}${field('Kind', v?.kind)}${field('Status', v?.status)}${field('Repository path', v?.repoPath)}${field('SHA-256', v?.sha256)}${field('Expression', v?.expression)}${field('Wardrobe', v?.wardrobe)}${field('Shot size', camera.shot_size)}${field('Angle', camera.angle)}${field('POV', camera.pov)}${field('Accepted base', v?.acceptedBase ?? 'none')}</dl><h4>Purpose</h4><p>${text(v?.purpose)}</p><h4>Known issues</h4>${list(v?.knownIssues, 'None reported')}</div></article>`;
  }).join('') : '<p class="empty">UNRECORDED visual entries</p>';

  const choiceHtml = choices.length ? choices.map((c) => `<article class="subcard"><h3>Node ${text(c?.nodeId)}</h3>${Array.isArray(c?.items) && c.items.length ? `<ul>${c.items.map((i) => `<li><strong>${text(i?.text)}</strong> → ${text(i?.next)}<pre>${esc(i?.effects === undefined || i?.effects === null ? 'UNRECORDED' : JSON.stringify(i.effects, null, 2))}</pre></li>`).join('')}</ul>` : '<p class="empty">UNRECORDED choices</p>'}</article>`).join('') : '<p class="empty">UNRECORDED choices</p>';
  const statusNames = [['readiness', 'Readiness'], ['narrativeQa', 'Narrative QA'], ['manifestStatus', 'Manifest status'], ['visualQa', 'Visual QA'], ['integrationStatus', 'Runtime integration'], ['staleStatus', 'Stale check'], ['validator', 'Validator'], ['humanGate', 'Human decision']];
  const productionHtml = statusNames.map(([key, label]) => field(label, production[key])).join('');
  const sourceHtml = sources.length ? `<ul>${sources.map((s) => `<li>${text(s?.path)} <span class="muted">SHA-256: ${text(s?.sha256)}</span></li>`).join('')}</ul>` : '<p class="empty">UNRECORDED sources</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline';">
<title>Production review — ${text(scene.title)}</title>
<style>
:root{color-scheme:light;--ink:#202936;--muted:#586779;--line:#d5dde7;--paper:#fff;--wash:#f3f6fa;--accent:#245b78}*{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:1100px;margin:0 auto;padding:clamp(1rem,4vw,3rem)}h1,h2,h3,h4{line-height:1.2}h1{font-size:clamp(1.8rem,5vw,2.7rem);margin:.2rem 0 .6rem}h2{font-size:1.35rem;border-bottom:1px solid var(--line);padding-bottom:.55rem;margin:0 0 1rem}h3{font-size:1.05rem;margin:.1rem 0 .7rem}h4{font-size:.9rem;margin:.9rem 0 .25rem;color:var(--accent)}section,.hero,.visual-card{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:1.1rem;margin:1rem 0}.eyebrow,.muted,.empty{color:var(--muted)}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:.78rem;font-weight:700}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1rem}.field{min-width:0}.field dt{font-size:.78rem;color:var(--muted);font-weight:700}.field dd{margin:.1rem 0 .7rem;overflow-wrap:anywhere}dl{margin:.5rem 0}.subcard{padding:.8rem;border:1px solid var(--line);border-radius:9px;margin:.75rem 0}ul{padding-left:1.3rem}li{margin:.35rem 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--wash);padding:.6rem;border-radius:6px;font: .82rem/1.45 ui-monospace,monospace;margin:.4rem 0}.visual-card{display:grid;grid-template-columns:minmax(150px,34%) 1fr;gap:1rem}.visual-card img{display:block;width:100%;height:auto;max-height:300px;object-fit:contain;background:#e9eef4;border-radius:7px}.thumbnail-placeholder{display:grid;place-items:center;min-height:130px;background:var(--wash);color:var(--muted);border-radius:7px;text-align:center}.visual-copy{min-width:0}@media(max-width:600px){.visual-card{grid-template-columns:1fr}.visual-card img{max-height:220px}}
</style>
</head>
<body><main>
<header class="hero"><div class="eyebrow">Static production review</div><h1>${text(scene.title)}</h1><dl class="grid">${field('Scene ID', scene.id)}${field('Source scene', scene.source_scene)}<div class="field"><dt>Purpose</dt><dd>${list(scene.purpose)}</dd></div></dl></header>
<section><h2>Narrative state</h2><div class="grid">${stateCard('Entry state', scene.entry_state)}${stateCard('Exit state', scene.exit_state)}</div><h3>Choices</h3>${choiceHtml}</section>
<section><h2>Visuals</h2>${visualHtml}</section>
<section><h2>Production status</h2><dl class="grid">${productionHtml}</dl><p class="muted">An accepted manifest or WebP asset, and a validator PASS, do not replace independent QA or Human decisions. Readiness is NOT_READY; stale status is UNKNOWN_NO_RUN_LEDGER.</p></section>
<section><h2>Runtime</h2><dl class="grid">${field('Route ID', runtime.routeId)}${field('Memory ID', memory.id)}${field('Memory title', memory.title)}${field('Replay node', memory.replayNode)}${field('Cover asset', memory.coverAsset)}<div class="field"><dt>Gallery assets</dt><dd>${list(memory.galleryAssets)}</dd></div><div class="field"><dt>Planned targets</dt><dd>${list(runtime.plannedTargets)}</dd></div></dl><h3>Node bindings</h3>${bindings.length ? `<ul>${bindings.map((b) => `<li>${text(b?.nodeId)} → ${text(b?.assetId)}</li>`).join('')}</ul>` : '<p class="empty">UNRECORDED</p>'}<h3>Next scenes</h3>${nextScenes.length ? `<ul>${nextScenes.map((n) => `<li>${text(n?.sceneId)} via ${text(n?.nodeId)}</li>`).join('')}</ul>` : '<p class="empty">UNRECORDED</p>'}</section>
<section><h2>Provenance</h2><dl>${field('Commit', provenance.commit)}</dl><h3>Sources</h3>${sourceHtml}</section>
</main></body></html>
`;
}
