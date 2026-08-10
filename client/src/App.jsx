import { useState } from 'react'
import { useAuth } from './auth/AuthContext.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { AppShell } from './layout/AppShell.jsx'
import { MenuView } from './pages/MenuView.jsx'
import { DebatesView } from './pages/DebatesView.jsx'
import { DataPanel } from './admin/DataPanel.jsx'

export default function App() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('menu')
  const [menuResetKey, setMenuResetKey] = useState(0)

  if (loading) return null
  if (!user) return <LoginPage />

  const handleNavigate = (nextView) => {
    if (nextView === 'menu') setMenuResetKey((k) => k + 1)
    setView(nextView)
  }

  return (
    <AppShell activeView={view} onNavigate={handleNavigate}>
      {view === 'menu' && <MenuView key={menuResetKey} />}
      {view === 'debates' && <DebatesView />}
      {view === 'dados' && user.isAdmin && <DataPanel />}
    </AppShell>
  )
}
