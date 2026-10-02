import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBenchmark, makeCases } from './benchmark-review-context.mjs';
import { writeScratchFiles } from './compile-review-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
try {
  if (process.argv.length !== 4 || process.argv[2] !== '--run-id' || !/^[a-zA-Z0-9_-]+$/.test(process.argv[3])) throw new Error('Usage: --run-id <prepared-run>');
  const relative = `generated/session-cache/quota-benchmark/${process.argv[3]}`, directory = path.join(root, relative);
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  const rebuilt = await buildBenchmark({ root, ref: manifest.source_ref, base: manifest.base_ref });
  for (const [name, expected] of rebuilt.files) if (await readFile(path.join(directory, name), 'utf8') !== expected) throw new Error(`prepared input changed: ${name}`);
  const target = await readFile(path.join(root, 'docs/narrative/scenes/vertical-slice/COM-02X.md'), 'utf8');
  const cases = makeCases(target), key = [];
  const sections = [];
  for (let i = 0; i < cases.length; i++) {
    const candidate = cases[i], order = i % 2 ? ['combined', 'baseline'] : ['baseline', 'combined'];
    const responses = [];
    for (let side = 0; side < 2; side++) {
      const result = JSON.parse(await readFile(path.join(directory, `${order[side]}-${candidate.id}.result.json`), 'utf8'));
      const label = side ? 'Y' : 'X';
      key.push({ case_id: candidate.id, label, arm: order[side] });
      responses.push(`<article><h3>回答 ${label}</h3><pre>${escape(JSON.stringify(result.result, null, 2))}</pre></article>`);
    }
    sections.push(`<section><h2>${candidate.id}</h2><details><summary>查看完整待審稿件</summary><pre>${escape(candidate.text)}</pre></details><div class="pair">${responses.join('')}</div><p>盲評記錄：X / Y / 差不多 / 兩者都不合格。請指出漏檢、誤報、定位問題與自然度判斷；可在聊天中按 T01–T06 回覆。</p></section>`);
  }
  const sources = [...new Set(rebuilt.manifest.matrix.length ? JSON.parse(new Map(rebuilt.files).get('source-audit.json'))[0].sources.map((source) => source.path) : [])];
  const links = sources.map((source) => `<li><a href="https://github.com/TsungmingLiu/seventeen-floor-neighbor/blob/${manifest.source_ref}/${source}">${escape(source)}</a></li>`).join('');
  const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>COM-02X QA 盲評</title><style>body{font-family:system-ui,sans-serif;background:#f6f5f1;color:#242424;margin:0;padding:28px;max-width:1440px;margin:auto}h1{font-size:28px}section{background:white;padding:24px;margin:24px 0;border-radius:12px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{min-width:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.65 ui-monospace,monospace;background:#f4f6f8;padding:18px;border-radius:8px}summary{cursor:pointer;padding:10px}p{line-height:1.65}a{color:#28569b}@media(max-width:800px){.pair{grid-template-columns:1fr}body{padding:12px}}</style><h1>COM-02X QA 盲評</h1><p>這是工程實驗，沒有批准劇情或 production gate。回答的組別、用量與預植錯誤答案都已隱藏。請先按 canonical context 判断回答是否有證據、是否漏掉硬錯誤或誤報；自然度可另列偏好，不必強迫二選一。</p><details><summary>共同 canonical 參考來源（固定 commit）</summary><ul>${links}</ul></details>${sections.join('')}<p>這份頁面不收集或傳送資料；盲評與採用決定仍待 Human。</p></html>`;
  await writeScratchFiles(relative, [['blind-review.html', html], ['blind-label-key.json', `${JSON.stringify(key, null, 2)}\n`]], { root });
  console.log(`Review: ${relative}/blind-review.html (Human review pending)`);
} catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
