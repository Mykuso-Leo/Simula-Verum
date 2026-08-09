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

  if (loading) return null
  if (!user) return <LoginPage />

  return (
    <AppShell activeView={view} onNavigate={setView}>
      {view === 'menu' && <MenuView />}
      {view === 'debates' && <DebatesView />}
      {view === 'dados' && user.isAdmin && <DataPanel />}
    </AppShell>
  )
}
