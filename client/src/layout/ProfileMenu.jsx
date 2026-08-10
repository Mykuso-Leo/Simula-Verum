import { useAuth } from '../auth/AuthContext.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import { ToggleSwitch } from '../components/ToggleSwitch.jsx'
import { EmojiPickerButton } from '../components/EmojiPickerButton.jsx'
import './ProfileMenu.css'

export function ProfileMenu() {
  const { user, updateProfile } = useAuth()
  const notify = useNotify()

  const handleToggle = (value) => {
    updateProfile({ autoEmojiEnabled: value }).catch(() => {})
  }

  const applyEmoji = (value) => {
    updateProfile({ emoji: value }).catch((err) => notify(err.message))
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

      <EmojiPickerButton value={user.emoji} onSelect={applyEmoji} onClear={() => applyEmoji('')} />
    </div>
  )
}
