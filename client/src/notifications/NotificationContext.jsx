import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { NotificationStack } from './NotificationStack.jsx'

const NotificationContext = createContext(null)

let nextId = 1

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const idsInFlight = useRef(new Set())

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((n) => n.id !== id))
    idsInFlight.current.delete(id)
  }, [])

  const notify = useCallback((message, options = {}) => {
    const id = nextId++
    idsInFlight.current.add(id)
    setNotifications((current) => [...current, { id, message, duration: options.duration ?? 4000 }])
    return id
  }, [])

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationStack notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const notify = useContext(NotificationContext)
  if (!notify) {
    throw new Error('useNotify precisa ser usado dentro de um NotificationProvider')
  }
  return notify
}
