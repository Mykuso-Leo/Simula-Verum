const REGIONAL_INDICATOR_BASE = 0x1f1e6

function isRegionalIndicator(codePoint) {
  return codePoint >= REGIONAL_INDICATOR_BASE && codePoint <= REGIONAL_INDICATOR_BASE + 25
}

// Inverso do gerador de bandeira do servidor (server/src/db/countries.js):
// duas regional indicators -> código ISO 3166-1 alpha-2 em minúsculo,
// pro flag-icons (ex: "br", "fr").
export function flagEmojiToIso2(text) {
  const codePoints = [...text].map((c) => c.codePointAt(0))
  if (codePoints.length !== 2 || !codePoints.every(isRegionalIndicator)) return null
  return codePoints
    .map((cp) => String.fromCharCode(cp - REGIONAL_INDICATOR_BASE + 65))
    .join('')
    .toLowerCase()
}
