import test from 'node:test';
import assert from 'node:assert/strict';
import { hasRenderableText, presentationModeForNode, speakerLabelForNode } from '../src/presentation.js';

test('pure choice nodes enter choice mode without placeholder speaker or text', () => {
  const node = { choices: [{ text: '回答', next: 'after' }] };
  assert.equal(hasRenderableText(node), false);
  assert.equal(presentationModeForNode(node), 'choice');
  assert.equal(speakerLabelForNode(node), '');
});

test('narration and protagonist speech use distinct presentation modes', () => {
  assert.equal(presentationModeForNode({ speaker: '旁白', text: '雨停了。' }), 'narration');
  assert.equal(speakerLabelForNode({ speaker: '旁白', text: '雨停了。' }), '');
  assert.equal(presentationModeForNode({ speaker: '你', text: '晚安。' }), 'protagonist');
  assert.equal(speakerLabelForNode({ speaker: '你', text: '晚安。' }), '我');
});

test('character speech and thought remain visually distinguishable', () => {
  assert.equal(presentationModeForNode({ speaker: '許棠', text: '還沒下班？' }), 'speech');
  assert.equal(speakerLabelForNode({ speaker: '許棠', text: '還沒下班？' }), '許棠');
  assert.equal(presentationModeForNode({ speaker: '內心', text: '（她是在等我嗎？）' }), 'thought');
  assert.equal(speakerLabelForNode({ speaker: '內心', text: '（她是在等我嗎？）' }), '');
});


test('Line speaker metadata distinguishes remote Xu messages from face-to-face speech', () => {
  assert.equal(speakerLabelForNode({speaker:'許棠',channel:'LINE',text:'收到。'}),'Line-許棠');
  assert.equal(speakerLabelForNode({speaker:'許棠',text:'收到。'}),'許棠');
  assert.equal(speakerLabelForNode({speaker:'許棠',speakerLabel:'Line-許棠',text:'收到。'}),'Line-許棠');
});
