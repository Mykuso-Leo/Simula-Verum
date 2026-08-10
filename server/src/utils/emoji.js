// Aceita: emojis pictográficos, bandeiras (par de regional indicators),
// sequências com zero-width joiner / variation selector, e emojis de
// "teclado" tipo 1️⃣ #️⃣ *️⃣ (dígito/#/* + variation selector + keycap).
const EMOJI_REGEX = /^(\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]|[‍️⃣])+$/u

export function isValidEmoji(value) {
  if (typeof value !== 'string') return false
  if (value === '') return true
  if ([...value].length > 8) return false
  return EMOJI_REGEX.test(value)
}
