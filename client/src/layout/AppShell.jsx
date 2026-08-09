import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { QrCodeButton } from '../components/QrCodeButton.jsx'
import { ThemePicker } from './ThemePicker.jsx'
import { ProfileMenu } from './ProfileMenu.jsx'
import './AppShell.css'

export function AppShell({ children, activeView, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const profileLabel = user.isAdmin ? `Administrador (${user.username})` : user.name

  const navigateTo = (view) => {
    onNavigate(view)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <button className="app-shell__hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {sidebarOpen && (
        <>
          <div className="app-shell__backdrop" onClick={() => setSidebarOpen(false)} />
          <aside className="app-shell__sidebar">
            <button
              type="button"
              className="app-shell__profile"
              onClick={() => setProfileMenuOpen((open) => !open)}
              disabled={user.isAdmin}
            >
              <span className="app-shell__emoji">{(!user.isAdmin && user.emoji) || '⚪'}</span>
              <span className="app-shell__name">{profileLabel}</span>
            </button>

            {profileMenuOpen && !user.isAdmin && <ProfileMenu />}

            <nav className="app-shell__nav">
              <button
                className={`app-shell__nav-item${activeView === 'menu' ? ' app-shell__nav-item--active' : ''}`}
                onClick={() => navigateTo('menu')}
              >
                Menu
              </button>
              <button
                className={`app-shell__nav-item${activeView === 'debates' ? ' app-shell__nav-item--active' : ''}`}
                onClick={() => navigateTo('debates')}
              >
                Debates
              </button>
              {user.isAdmin && (
                <button
                  className={`app-shell__nav-item${activeView === 'dados' ? ' app-shell__nav-item--active' : ''}`}
                  onClick={() => navigateTo('dados')}
                >
                  Dados
                </button>
              )}
            </nav>

            <ThemePicker />

            <div className="app-shell__qr">
              <QrCodeButton />
            </div>

            <button className="app-shell__logout" onClick={logout}>
              Sair
            </button>
          </aside>
        </>
      )}

      <div className="app-shell__content">{children}</div>
    </div>
  )
}
