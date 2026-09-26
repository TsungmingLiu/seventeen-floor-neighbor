import { spawn } from 'node:child_process';
import net from 'node:net';

const args = process.argv.slice(2);

function value(name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function has(name) {
  return args.includes(name);
}

function usage() {
  console.log(`
Usage:
  node tools/codespace-accept.mjs [options]

Options:
  --repo OWNER/REPO       Repository (default: TsungmingLiu/seventeen-floor-neighbor)
  --branch BRANCH         Branch/ref to create from (default: main)
  --codespace NAME        Reuse an existing Codespace instead of creating one
  --keep                  Keep a newly created Codespace after success
  --public-review         Make port 4173 public after validation and keep the Codespace
  --dry-run               Print the planned lifecycle without calling GitHub
  --help                  Show this help

Canonical modes:
  npm run codespace:accept
    Create ephemeral Codespace -> clean verify -> preview -> private tunnel smoke -> delete on success.

  npm run codespace:review
    Same verification, then expose 4173 publicly for temporary AI browser review and keep it.
`);
}

if (has('--help')) {
  usage();
  process.exit(0);
}

const repository = value('--repo', 'TsungmingLiu/seventeen-floor-neighbor');
const branch = value('--branch', 'main');
const existingCodespace = value('--codespace');
const publicReview = has('--public-review');
const keep = has('--keep') || publicReview;
const dryRun = has('--dry-run');
const repoName = repository.split('/').at(-1);
const workspace = `/workspaces/${repoName}`;
const previewPort = 4173;
const displayName = `w3-ai-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;

if (!/^[^/]+\/[^/]+$/.test(repository)) {
  throw new Error(`--repo must be OWNER/REPO, received: ${repository}`);
}

function quote(value) {
  return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

async function run(command, commandArgs, { capture = false, allowFailure = false } = {}) {
  if (dryRun) {
    console.log('$', [command, ...commandArgs].map(part => quote(part)).join(' '));
    return '';
  }

  return await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    if (capture) {
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });
    }

    child.once('error', reject);
    child.once('exit', code => {
      if (code === 0 || allowFailure) {
        if (capture && stderr) process.stderr.write(stderr);
        resolve(stdout.trim());
      } else {
        reject(new Error(
          `${command} ${commandArgs.join(' ')} exited with code ${code}` +
          (stderr ? `\n${stderr.trim()}` : '')
        ));
      }
    });
  });
}

async function selectMachine() {
  const output = await run('gh', [
    'api',
    `repos/${repository}/codespaces/machines?ref=${encodeURIComponent(branch)}`,
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2026-03-10'
  ], { capture: true });

  const machines = JSON.parse(output || '{}').machines || [];
  if (machines.length === 0) {
    throw new Error(`No Codespaces machine types are available for ${repository}@${branch}`);
  }

  machines.sort((a, b) =>
    Number(a.cpus ?? Number.MAX_SAFE_INTEGER) - Number(b.cpus ?? Number.MAX_SAFE_INTEGER) ||
    Number(a.memory_in_bytes ?? Number.MAX_SAFE_INTEGER) - Number(b.memory_in_bytes ?? Number.MAX_SAFE_INTEGER) ||
    Number(a.storage_in_bytes ?? Number.MAX_SAFE_INTEGER) - Number(b.storage_in_bytes ?? Number.MAX_SAFE_INTEGER) ||
    String(a.name).localeCompare(String(b.name))
  );

  const selected = machines[0];
  console.log(
    `[codespace] selected machine ${selected.name} (${selected.display_name || `${selected.cpus} cores`})`
  );
  return selected.name;
}

async function createCodespace() {
  const machine = await selectMachine();

  const output = await run('gh', [
    'api',
    '--method', 'POST',
    `repos/${repository}/codespaces`,
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2026-03-10',
    '-f', `ref=${branch}`,
    '-f', `machine=${machine}`,
    '-f', 'devcontainer_path=.devcontainer/devcontainer.json',
    '-F', 'idle_timeout_minutes=20',
    '-F', 'retention_period_minutes=60',
    '-f', `display_name=${displayName}`
  ], { capture: true });

  const created = JSON.parse(output || '{}');
  if (!created.name) {
    throw new Error('Codespaces create API returned no codespace name.');
  }

  console.log(`[codespace] created ${created.name} (state=${created.state || 'unknown'})`);
  return created.name;
}

async function waitForAvailable(codespace, timeoutMs = 15 * 60_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const output = await run('gh', [
      'codespace', 'view',
      '-c', codespace,
      '--json', 'state,name,displayName'
    ], { capture: true });

    const info = JSON.parse(output);
    console.log(`[codespace] state=${info.state}`);
    if (info.state === 'Available') return;

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error(`Codespace ${codespace} did not become Available within ${timeoutMs / 60_000} minutes.`);
}

async function waitForForwardedPort(codespace, timeoutMs = 90_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const output = await run('gh', [
      'codespace', 'ports',
      '-c', codespace,
      '--json', 'browseUrl,label,sourcePort,visibility'
    ], { capture: true });

    const ports = JSON.parse(output || '[]');
    const port = ports.find(item => Number(item.sourcePort) === previewPort);
    if (port?.browseUrl) return port;

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error(`Port ${previewPort} did not become available within ${timeoutMs / 1000} seconds.`);
}

async function getFreeLocalPort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(error => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

async function waitForHttp(url, forwardProcess, timeoutMs = 120_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (forwardProcess.exitCode != null) {
      throw new Error(`gh codespace ports forward exited early with code ${forwardProcess.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        await response.arrayBuffer();
        return;
      }
    } catch {
      // Tunnel may not be ready yet.
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for forwarded preview: ${url}`);
}

async function forwardedSmoke(codespace) {
  const localPort = await getFreeLocalPort();
  console.log(`[codespace] opening private tunnel 4173 -> localhost:${localPort}`);

  const forward = spawn('gh', [
    'codespace', 'ports', 'forward',
    `${previewPort}:${localPort}`,
    '-c', codespace
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env
  });

  forward.stdout.on('data', chunk => process.stdout.write(chunk));
  forward.stderr.on('data', chunk => process.stderr.write(chunk));

  try {
    const base = `http://127.0.0.1:${localPort}`;
    await waitForHttp(`${base}/`, forward);

    const checks = [
      ['/', 200, 'text/html'],
      ['/styles.css', 200, 'text/css'],
      ['/app.js', 200, 'text/javascript'],
      ['/content/routes/index.json', 200, 'application/json'],
      ['/future-client-route', 200, 'text/html'],
      ['/definitely-missing.w3-asset', 404, 'text/plain']
    ];

    for (const [path, status, type] of checks) {
      const response = await fetch(`${base}${path}`);
      if (response.status !== status) {
        throw new Error(`Forwarded smoke ${path}: expected ${status}, got ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith(type)) {
        throw new Error(`Forwarded smoke ${path}: expected ${type}, got ${contentType}`);
      }
      await response.arrayBuffer();
    }

    console.log('[codespace] private forwarded preview smoke passed.');
  } finally {
    if (forward.exitCode == null) {
      forward.kill('SIGTERM');
      await new Promise(resolve => {
        forward.once('exit', resolve);
        setTimeout(resolve, 2000);
      });
    }
  }
}

async function printPreviewLog(codespace) {
  console.error('\n[codespace] preview did not become reachable; tailing remote log:');
  await run('gh', [
    'codespace', 'ssh',
    '-c', codespace,
    `bash -lc ${quote('tail -200 /tmp/w3-preview.log 2>/dev/null || true')}`
  ], { allowFailure: true });
}

function printPlan() {
  console.log([
    'W3 AI-operated Codespace acceptance plan:',
    `  repo: ${repository}`,
    `  branch: ${branch}`,
    existingCodespace
      ? `  reuse: ${existingCodespace}`
      : `  create display name: ${displayName}`,
    `  preview port: ${previewPort}`,
    `  public review: ${publicReview ? 'yes' : 'no'}`,
    `  keep after success: ${keep ? 'yes' : 'no'}`
  ].join('\n'));
}

printPlan();

if (dryRun) {
  if (!existingCodespace) {
    await run('gh', [
      'api',
      `repos/${repository}/codespaces/machines?ref=${encodeURIComponent(branch)}`,
      '-H', 'Accept: application/vnd.github+json',
      '-H', 'X-GitHub-Api-Version: 2026-03-10'
    ]);
    await run('gh', [
      'api',
      '--method', 'POST',
      `repos/${repository}/codespaces`,
      '-f', `ref=${branch}`,
      '-f', 'machine=<lowest-available-machine>',
      '-f', 'devcontainer_path=.devcontainer/devcontainer.json',
      '-F', 'idle_timeout_minutes=20',
      '-F', 'retention_period_minutes=60',
      '-f', `display_name=${displayName}`
    ]);
  }
  await run('gh', ['codespace', 'ssh', '-c', existingCodespace || '<created-codespace>', '<acceptance-command>']);
  await run('gh', ['codespace', 'ports', 'forward', '4173:<ephemeral-local-port>', '-c', existingCodespace || '<created-codespace>']);
  if (publicReview) {
    await run('gh', ['codespace', 'ports', 'visibility', '4173:public', '-c', existingCodespace || '<created-codespace>']);
  } else if (!keep && !existingCodespace) {
    await run('gh', ['codespace', 'delete', '-c', '<created-codespace>', '-f']);
  }
  process.exit(0);
}

await run('gh', ['--version']);
await run('gh', ['auth', 'status']);

let codespace = existingCodespace;
let createdByScript = false;
let success = false;

try {
  if (!codespace) {
    console.log('[codespace] creating ephemeral acceptance environment through REST API...');
    codespace = await createCodespace();
    createdByScript = true;
  }

  console.log(`[codespace] using ${codespace}`);
  await waitForAvailable(codespace);

  const remoteScript = `set -euo pipefail
cd ${quote(workspace)}
echo "HEAD=$(git rev-parse HEAD)"
node --version
ffmpeg -version | head -1
ffprobe -version | head -1
test -x /usr/sbin/sshd
rm -rf generated/runtime-assets dist
npm run assets:check
npm run assets:build
npm run build
npm run validate
npm test
git diff --check
git diff --exit-code
nohup node tools/preview-server.mjs --preview --skip-build --port 4173 > /tmp/w3-preview.log 2>&1 </dev/null &
echo $! > /tmp/w3-preview.pid
for attempt in $(seq 1 60); do
  if node -e "fetch('http://127.0.0.1:4173/').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"; then
    echo "Preview is listening on 127.0.0.1:4173"
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    echo "Preview failed to become ready" >&2
    tail -200 /tmp/w3-preview.log >&2 || true
    exit 1
  fi
  sleep 1
done
`;

  console.log('[codespace] running clean restore/build/test inside Codespace...');
  await run('gh', [
    'codespace', 'ssh',
    '-c', codespace,
    `bash -lc ${quote(remoteScript)}`
  ]);

  let port;
  try {
    port = await waitForForwardedPort(codespace);
  } catch (error) {
    await printPreviewLog(codespace);
    throw error;
  }

  console.log(`[codespace] 4173 forwarded as ${port.browseUrl} (visibility=${port.visibility})`);
  await forwardedSmoke(codespace);

  if (publicReview) {
    console.log('[codespace] enabling temporary public review URL...');
    await run('gh', [
      'codespace', 'ports', 'visibility',
      '4173:public',
      '-c', codespace
    ]);

    const publicPort = await waitForForwardedPort(codespace);
    console.log('\nAI REVIEW URL');
    console.log(publicPort.browseUrl);
    console.log('\nAfter browser review, clean up with:');
    console.log(`gh codespace delete -c ${codespace} -f`);
  }

  success = true;
  console.log('\nW3 AI-operated Codespace acceptance passed.');
} catch (error) {
  console.error('\nW3 AI-operated Codespace acceptance FAILED.');
  console.error(error instanceof Error ? error.stack || error.message : error);
  if (createdByScript && codespace) {
    console.error(`Codespace kept for debugging: ${codespace}`);
    console.error('It was created with a 20m idle timeout and 1h retention period.');
    console.error(`Manual cleanup: gh codespace delete -c ${codespace} -f`);
  }
  process.exitCode = 1;
} finally {
  if (success && createdByScript && codespace && !keep) {
    console.log(`[codespace] deleting ephemeral Codespace ${codespace}...`);
    await run('gh', ['codespace', 'delete', '-c', codespace, '-f']);
  } else if (success && codespace && keep) {
    console.log(`[codespace] kept: ${codespace}`);
  }
}
