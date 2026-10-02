import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './content-lib.mjs';
import { buildProductionImpact } from './production-impact.mjs';
import { sha256 } from './render-cg-packets.mjs';

// A bounded invocation gate: recompute source acquisition and impact, never consume an old report.
// Explicit baseline is caller authority; this check does not prove QA or Human acceptance.
export async function checkProductionIntegration({ sceneId, from, to, root = projectRoot }) {
  if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(sceneId)) throw new Error('invalid scene ID');
  const destination = path.join(root, `generated/session-cache/integration-check/${sceneId}/check.json`);
  await rm(destination, { force: true });
  if (!from || from === 'WORKTREE' || !to) throw new Error('explicit committed --from and --to <commit|WORKTREE> required');
  const impact = await buildProductionImpact({ sceneId, from, to, root });
  const stale = impact.would_invalidate.includes(`integration:${sceneId}`);
  const report = {
    schema_version: '1.0.0', kind: 'BOUNDED_PRE_INTEGRATION_CHECK',
    status: stale ? 'BLOCKED_STALE_INTEGRATION' : 'NO_STALE_DIFF',
    qa_acceptance: 'NOT_EVALUATED', human_acceptance: 'NOT_EVALUATED', ledger_mutated: false,
    impact
  };
  const data = `${JSON.stringify(report, null, 2)}\n`;
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, data, { flag: 'wx' });
    await rename(temporary, destination);
  } finally { await rm(temporary, { force: true }); }
  return { path: path.relative(root, destination), sha256: sha256(data), report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 6 || args.some((arg, index) => index % 2 === 0 && !['--scene', '--from', '--to'].includes(arg)) ||
      new Set(args.filter((_, index) => index % 2 === 0)).size !== 3) {
      throw new Error('usage: npm run production:integration:check -- --scene <id> --from <commit> --to <commit|WORKTREE>');
    }
    const options = Object.fromEntries([0, 2, 4].map((index) => [args[index].slice(2), args[index + 1]]));
    const result = await checkProductionIntegration({ sceneId: options.scene, from: options.from, to: options.to });
    console.log(`${result.report.status}: ${result.path} SHA-256 ${result.sha256}`);
    if (result.report.impact.manifest_reconciliation_required.length) {
      console.warn('RECONCILIATION_REQUIRED: whole-manifest hashes changed; recorded provenance needs review.');
    }
    if (result.report.status === 'BLOCKED_STALE_INTEGRATION') {
      throw new Error(`stale integration:${options.scene}; ${result.report.impact.changes.length} changed artifact(s)`);
    }
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
