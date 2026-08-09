import { useAuth } from '../auth/AuthContext.jsx'
import { THEMES } from '../theme/themes.js'
import { HelpHint } from '../components/HelpHint.jsx'
import './ThemePicker.css'

export function ThemePicker() {
  const { user, updateProfile } = useAuth()

  if (user.isAdmin) return null

  const handleSelect = (themeId) => {
    if (themeId === user.theme) return
    updateProfile({ theme: themeId }).catch(() => {})
  }

  return (
    <div className="theme-picker">
      <p className="theme-picker__label">
        Cores
        <HelpHint text="Muda a cor de fundo e da barra lateral do site só para você. Fica salvo na sua conta e volta a aparecer assim da próxima vez que você entrar." />
      </p>
      <div className="theme-picker__grid">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-picker__swatch${user.theme === theme.id ? ' theme-picker__swatch--active' : ''}`}
            style={{ background: theme.bg }}
            title={theme.label}
            aria-label={theme.label}
            onClick={() => handleSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  )
}
