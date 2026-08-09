import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { QrCodeButton } from '../components/QrCodeButton.jsx'
import './LoginPage.css'

const NAME_REGEX = /^[\p{L}\s]+$/u

export function LoginPage() {
  const [mode, setMode] = useState('user')

  return (
    <div className="login-page">
      <h1 className="login-page__logo">Simula Verum</h1>
      {mode === 'user' ? <UserLoginForm onSwitchToAdmin={() => setMode('admin')} /> : <AdminLoginForm onSwitchToUser={() => setMode('user')} />}
      <div className="login-page__footer">
        <QrCodeButton />
      </div>
    </div>
  )
}

function UserLoginForm({ onSwitchToAdmin }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginAsUser } = useAuth()
  const notify = useNotify()

  const trimmed = name.trim()
  const isValid = trimmed.length >= 3 && NAME_REGEX.test(trimmed)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await loginAsUser(trimmed)
    } catch (err) {
      notify(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form className="login-page__form" onSubmit={handleSubmit}>
        <input
          className="login-page__input"
          type="text"
          placeholder="Insira seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="login-page__submit" type="submit" disabled={!isValid || submitting}>
          Entrar
        </button>
      </form>
      <button type="button" className="login-page__link" onClick={onSwitchToAdmin}>
        Entrar como administrador
      </button>
    </>
  )
}

function AdminLoginForm({ onSwitchToUser }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginAsAdmin } = useAuth()
  const notify = useNotify()

  const isValid = username.trim().length >= 3 && password.trim().length >= 3

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await loginAsAdmin(username.trim(), password.trim())
    } catch (err) {
      notify(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-page__form login-page__form--admin" onSubmit={handleSubmit}>
      <input
        className="login-page__input"
        type="text"
        placeholder="Insira o usuário do administrador"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="login-page__input"
        type="password"
        placeholder="Insira a senha do administrador"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="login-page__submit" type="submit" disabled={!isValid || submitting}>
        Entrar como administrador
      </button>
      <button type="button" className="login-page__link" onClick={onSwitchToUser}>
        Entrar como usuário
      </button>
    </form>
  )
}
