import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import { ToggleSwitch } from '../components/ToggleSwitch.jsx'
import './ProfileMenu.css'

const QUICK_EMOJIS = ['⚪', '😀', '😎', '🔥', '⭐', '🎯', '🦁', '🐺', '🕊️', '⚡', '🌍', '📣']

export function ProfileMenu() {
  const { user, updateProfile } = useAuth()
  const [emojiInput, setEmojiInput] = useState(user.emoji || '')

  const handleToggle = (value) => {
    updateProfile({ autoEmojiEnabled: value }).catch(() => {})
  }

  const applyEmoji = (value) => {
    const trimmed = value.trim()
    setEmojiInput(trimmed)
    updateProfile({ emoji: trimmed }).catch(() => {})
  }

  return (
    <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
      <div className="profile-menu__toggle-row">
        <span className="profile-menu__toggle-label">
          Emoji automático em simulações
          <HelpHint text="Quando ativado, seu emoji muda sozinho para o emoji do país/personagem que você representar ao entrar em uma simulação. Você pode trocar manualmente a qualquer momento — na próxima simulação, ele volta a mudar automaticamente se isso estiver ligado." />
        </span>
        <ToggleSwitch checked={user.autoEmojiEnabled} onChange={handleToggle} label="Emoji automático em simulações" />
      </div>

      <div className="profile-menu__quick-emojis">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`profile-menu__emoji-option${user.emoji === emoji ? ' profile-menu__emoji-option--active' : ''}`}
            onClick={() => applyEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <form
        className="profile-menu__custom"
        onSubmit={(e) => {
          e.preventDefault()
          applyEmoji(emojiInput)
        }}
      >
        <input
          type="text"
          value={emojiInput}
          onChange={(e) => setEmojiInput(e.target.value)}
          placeholder="Ou digite/cole qualquer emoji"
          maxLength={8}
        />
        <button type="submit">Aplicar</button>
      </form>
    </div>
  )
}
