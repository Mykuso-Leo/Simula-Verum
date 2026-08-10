import { flagEmojiToIso2 } from '../utils/flagEmoji.js'
import './Emoji.css'

export function Emoji({ text, className = '' }) {
  if (!text) return null

  const iso2 = flagEmojiToIso2(text)
  if (iso2) {
    return (
      <span
        className={`fi fi-${iso2} emoji-flag ${className}`}
        role="img"
        aria-label={`bandeira: ${iso2.toUpperCase()}`}
      />
    )
  }

  return (
    <span className={`emoji-native ${className}`} role="img">
      {text}
    </span>
  )
}
