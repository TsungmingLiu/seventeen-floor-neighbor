import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLAYER_NAME, normalizePlayerName, interpolatePlayerName, submittedPlayerName } from '../src/player-name.js';

test('quick-start submission defaults only blank strings and preserves strict saved-name validation', () => {
  assert.equal(DEFAULT_PLAYER_NAME, '劉樂');
  for (const value of ['', '   ', '\t\n', '\u3000']) assert.equal(submittedPlayerName(value), '劉樂');
  assert.equal(submittedPlayerName('  小雨  '), '小雨');
  for (const value of [null, undefined, 0, '[bad]', '小\n雨', '雨'.repeat(21)]) {
    assert.equal(submittedPlayerName(value), null);
  }
  assert.equal(normalizePlayerName(''), null, 'missing save names still need explicit confirmation');
});

test('name validation trims, counts Unicode characters, and rejects empty/oversize/control/token names', () => {
  assert.equal(normalizePlayerName('  小雨  '), '小雨');
  assert.equal(normalizePlayerName('😀'.repeat(20)), '😀'.repeat(20));
  for (const invalid of [null, '', '   ', '雨'.repeat(21), '小\n雨', '[PLAYER_NAME]', '雨\u200b']) {
    assert.equal(normalizePlayerName(invalid), null);
  }
});

test('same name renders every approved token and unknown tokens stay visible', () => {
  assert.equal(interpolatePlayerName('[PLAYER_NAME]，[PLAYER_NAME]。[UNKNOWN]', '小雨'), '小雨，小雨。[UNKNOWN]');
  assert.throws(() => interpolatePlayerName('[PLAYER_NAME]。'), /display name is required/);
  assert.equal(interpolatePlayerName(undefined), '');
});


test('entered dollar replacement patterns are literal names', () => {
  for (const name of ['$&', '$$', '$`', "$'", '$1']) {
    assert.equal(interpolatePlayerName('我叫[PLAYER_NAME]。[PLAYER_NAME]！', name), `我叫${name}。${name}！`);
  }
});
