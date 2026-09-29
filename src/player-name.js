// The value is supplied by the chapter's eventual display-name contract.
// A missing value must never turn an implementation token into player-facing text.
export function interpolatePlayerName(text, displayName) {
  if (!text.includes('[PLAYER_NAME]')) return text;
  if (typeof displayName !== 'string' || !displayName.trim()) {
    throw new Error('A player display name is required for [PLAYER_NAME] dialogue');
  }
  return text.replaceAll('[PLAYER_NAME]', displayName.trim());
}
