import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../api/api.js'
import { applyTheme } from '../theme/applyTheme.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    applyTheme(user && !user.isAdmin ? user.theme : 'white')
  }, [user])

  const loginAsUser = useCallback(async (name) => {
    const loggedInUser = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const loginAsAdmin = useCallback(async (username, password) => {
    const loggedInAdmin = await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    setUser(loggedInAdmin)
    return loggedInAdmin
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (partial) => {
    const updatedUser = await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(partial)
    })
    setUser(updatedUser)
    return updatedUser
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginAsUser, loginAsAdmin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
