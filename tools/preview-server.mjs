import { createReadStream, watch } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = path.join(projectRoot, 'dist');
const args = process.argv.slice(2);

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const mode = args.includes('--dev') ? 'dev' : args.includes('--smoke') ? 'smoke' : 'preview';
const skipBuild = args.includes('--skip-build');
const port = Number(argValue('--port', process.env.PORT || '4173'));
const host = argValue('--host', process.env.HOST || '0.0.0.0');

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error(\`Invalid preview port: \${port}\`);
}

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.m4a', 'audio/mp4'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2']
]);

function contentType(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function isInsideDist(candidate) {
  const relative = path.relative(distRoot, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function resolveRequestPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { status: 400 };
  }

  const clean = decoded.replace(/^\/+/, '');
  let candidate = path.resolve(distRoot, clean || 'index.html');
  if (!isInsideDist(candidate)) {
    return { status: 403 };
  }

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      candidate = path.join(candidate, 'index.html');
      const indexInfo = await stat(candidate);
      return { status: 200, filePath: candidate, info: indexInfo };
    }
    if (info.isFile()) {
      return { status: 200, filePath: candidate, info };
    }
  } catch {
    // Extensionless URLs fall back to index.html so a future client-side route
    // can be refreshed without a 404. Missing asset-like URLs stay 404.
  }

  if (!path.extname(clean)) {
    candidate = path.join(distRoot, 'index.html');
    try {
      const info = await stat(candidate);
      return { status: 200, filePath: candidate, info };
    } catch {
      return { status: 404 };
    }
  }

  return { status: 404 };
}

function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return { invalid: true };

  let start;
  let end;

  if (match[1] === '') {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return { invalid: true };
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return { invalid: true };
  }

  end = Math.min(end, size - 1);
  return { start, end };
}

function sendText(res, status, message) {
  const body = Buffer.from(message);
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': body.length,
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

async function handleRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendText(res, 405, 'Method Not Allowed');
    return;
  }

  const url = new URL(req.url || '/', 'http://preview.local');
  const resolved = await resolveRequestPath(url.pathname);
  if (resolved.status !== 200) {
    sendText(
      res,
      resolved.status,
      resolved.status === 400 ? 'Bad Request' :
        resolved.status === 403 ? 'Forbidden' : 'Not Found'
    );
    return;
  }

  const { filePath, info } = resolved;
  const range = parseRange(req.headers.range, info.size);
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    'Content-Type': contentType(filePath),
    'X-Content-Type-Options': 'nosniff'
  };

  if (range?.invalid) {
    res.writeHead(416, {
      ...headers,
      'Content-Range': \`bytes */\${info.size}\`
    });
    res.end();
    return;
  }

  if (range) {
    const length = range.end - range.start + 1;
    res.writeHead(206, {
      ...headers,
      'Content-Length': length,
      'Content-Range': \`bytes \${range.start}-\${range.end}/\${info.size}\`
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(filePath, { start: range.start, end: range.end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    ...headers,
    'Content-Length': info.size
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(projectRoot, 'tools/build.mjs')], {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    child.once('error', reject);
    child.once('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(\`Build exited with code \${code}\`));
    });
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

async function findFirstFileWithExtension(root, extension) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFirstFileWithExtension(fullPath, extension);
      if (nested) return nested;
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) {
      return fullPath;
    }
  }
  return null;
}

async function runSmoke(actualPort) {
  const base = \`http://127.0.0.1:\${actualPort}\`;
  const checks = [
    ['/', 200, 'text/html'],
    ['/styles.css', 200, 'text/css'],
    ['/app.js', 200, 'text/javascript'],
    ['/content/routes/index.json', 200, 'application/json'],
    ['/future-client-route', 200, 'text/html'],
    ['/definitely-missing.w3-asset', 404, 'text/plain']
  ];

  for (const [requestPath, expectedStatus, expectedType] of checks) {
    const response = await fetch(\`\${base}\${requestPath}\`);
    if (response.status !== expectedStatus) {
      throw new Error(\`Smoke check \${requestPath}: expected \${expectedStatus}, received \${response.status}\`);
    }
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith(expectedType)) {
      throw new Error(\`Smoke check \${requestPath}: expected content-type \${expectedType}, received \${type}\`);
    }
    await response.arrayBuffer();
  }

  const mp4 = await findFirstFileWithExtension(distRoot, '.mp4');
  if (mp4) {
    const relative = path.relative(distRoot, mp4).split(path.sep).map(encodeURIComponent).join('/');
    const response = await fetch(\`\${base}/\${relative}\`, {
      headers: { Range: 'bytes=0-15' }
    });
    if (response.status !== 206 || !response.headers.get('content-range')) {
      throw new Error('Smoke check video range request did not return HTTP 206 with Content-Range.');
    }
    await response.arrayBuffer();
  }

  console.log('Preview smoke checks passed.');
}

async function startDevWatchers() {
  const roots = ['public', 'src', 'content', 'assets-src']
    .map(name => path.join(projectRoot, name));

  let timer = null;
  let rebuilding = false;
  let pending = false;

  const rebuild = async () => {
    if (rebuilding) {
      pending = true;
      return;
    }
    rebuilding = true;
    do {
      pending = false;
      try {
        console.log('[dev] source change detected; rebuilding...');
        await runBuild();
        console.log('[dev] rebuild complete; refresh the forwarded preview.');
      } catch (error) {
        console.error('[dev] rebuild failed:', error.message);
      }
    } while (pending);
    rebuilding = false;
  };

  const watchers = roots.map(root => watch(root, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 180);
  }));

  return () => {
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
  };
}

if (!skipBuild) {
  await runBuild();
}

const server = createServer((req, res) => {
  handleRequest(req, res).catch(error => {
    console.error(error);
    if (!res.headersSent) sendText(res, 500, 'Internal Server Error');
    else res.destroy(error);
  });
});

await listen(server);
const address = server.address();
const actualPort = typeof address === 'object' && address ? address.port : port;
console.log(\`W3 \${mode} server listening on http://\${host}:\${actualPort}\`);

if (mode === 'smoke') {
  try {
    await runSmoke(actualPort);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
} else {
  const stopWatching = mode === 'dev' ? await startDevWatchers() : () => {};
  const shutdown = () => {
    stopWatching();
    server.close(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
