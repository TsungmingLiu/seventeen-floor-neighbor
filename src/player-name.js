export const PLAYER_NAME_MAX_LENGTH = 20;

export function normalizePlayerName(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (!name || Array.from(name).length > PLAYER_NAME_MAX_LENGTH || /[\p{Cc}\p{Cf}\[\]]/u.test(name)) return null;
  return name;
}

// Replace only the approved token; unknown tokens remain visible for diagnosis.
export function interpolatePlayerName(text, displayName) {
  text = text || '';
  if (!text.includes('[PLAYER_NAME]')) return text;
  const name = normalizePlayerName(displayName);
  if (!name) throw new Error('A player display name is required for [PLAYER_NAME] dialogue');
  return text.replaceAll('[PLAYER_NAME]', () => name);
}
