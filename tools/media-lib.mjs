import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm']);
const SVG_EXTENSIONS = new Set(['.svg']);

export function mediaKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (SVG_EXTENSIONS.has(ext)) return 'svg';
  return null;
}

export async function requireMediaTools() {
  const tools = [];
  for (const command of ['ffprobe', 'ffmpeg']) {
    try {
      const { stdout, stderr } = await execFileAsync(command, ['-version'], { timeout: 10_000, maxBuffer: 1024 * 1024 });
      tools.push({ command, version: (stdout || stderr).split('\n')[0] });
    } catch (error) {
      const detail = error?.code === 'ENOENT' ? 'not found on PATH' : (error?.stderr || error?.message || String(error)).trim();
      throw new Error(
        `${command} is required for W2 media validation (${detail}). Install FFmpeg so both ffmpeg and ffprobe are on PATH.`
      );
    }
  }
  return tools;
}

export async function probeMedia(filePath) {
  const kind = mediaKind(filePath);
  if (!kind) throw new Error(`unsupported media extension: ${path.extname(filePath)}`);

  if (kind === 'svg') {
    const text = await readFile(filePath, 'utf8');
    if (!/<svg\b/i.test(text) || !/<\/svg>/i.test(text)) throw new Error('invalid or incomplete SVG document');
    return { kind, format: 'svg', width: null, height: null, duration: null, codec: 'svg' };
  }

  let parsed;
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=codec_name,codec_type,width,height,duration',
        '-show_entries', 'format=format_name,duration',
        '-of', 'json',
        filePath
      ],
      { timeout: 30_000, maxBuffer: 4 * 1024 * 1024 }
    );
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`ffprobe failed: ${(error?.stderr || error?.message || String(error)).trim()}`);
  }

  const stream = parsed.streams?.find((item) => item.codec_type === 'video') || parsed.streams?.[0];
  if (!stream) throw new Error('ffprobe found no visual stream');
  const durationRaw = Number(stream.duration ?? parsed.format?.duration);
  return {
    kind,
    format: parsed.format?.format_name || null,
    codec: stream.codec_name || null,
    width: Number.isFinite(Number(stream.width)) ? Number(stream.width) : null,
    height: Number.isFinite(Number(stream.height)) ? Number(stream.height) : null,
    duration: Number.isFinite(durationRaw) ? durationRaw : null
  };
}

export async function decodeMedia(filePath) {
  const kind = mediaKind(filePath);
  if (kind === 'svg') return;
  if (!kind) throw new Error(`unsupported media extension: ${path.extname(filePath)}`);

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-v', 'error',
        '-xerror',
        '-i', filePath,
        '-map', '0:v:0',
        '-an',
        '-sn',
        '-dn',
        '-f', 'null',
        '-'
      ],
      { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }
    );
  } catch (error) {
    throw new Error(`full decode failed: ${(error?.stderr || error?.message || String(error)).trim()}`);
  }
}

export async function inspectMedia(filePath) {
  const probe = await probeMedia(filePath);
  await decodeMedia(filePath);
  return probe;
}

export function ratio(width, height) {
  if (!width || !height) return null;
  return width / height;
}

export function approxEqual(a, b, tolerance = 0.02) {
  if (a == null || b == null) return true;
  return Math.abs(a - b) <= tolerance;
}
