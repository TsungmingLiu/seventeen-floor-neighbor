export function hasRenderableText(node) {
  return typeof node?.text === 'string' && node.text.trim().length > 0;
}

export function presentationModeForNode(node) {
  if (!node) return 'speech';
  if (Array.isArray(node.choices) && node.choices.length && !hasRenderableText(node)) return 'choice';
  if (node.presentation === 'thought' || node.speaker === '內心' || node.speaker === '心聲') return 'thought';
  if (node.speaker === '旁白' || !node.speaker) return 'narration';
  if (node.speaker === '你' || node.speaker === '我') return 'protagonist';
  return 'speech';
}

export function speakerLabelForNode(node, mode = presentationModeForNode(node)) {
  if (mode === 'protagonist') return '我';
  if (mode === 'speech') return node?.speakerLabel || (node?.speaker === '許棠' && node?.channel === 'LINE' ? 'Line-許棠' : node?.speaker) || '';
  return '';
}
