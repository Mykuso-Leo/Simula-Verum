import { THEMES } from './themes.js'

export function applyTheme(themeId) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0]
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.bg)
  root.style.setProperty('--color-sidebar', theme.sidebar)
  root.style.setProperty('--color-text', theme.text)
}
