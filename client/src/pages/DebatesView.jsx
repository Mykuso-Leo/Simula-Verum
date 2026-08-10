import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { listDebateMessages, sendDebateMessage, getForumState, deleteDebateMessage } from '../api/debates.js'
import { formatDebateTimestamp } from '../utils/debateTimestamp.js'
import { ModerationPanel } from '../admin/ModerationPanel.jsx'
import { Emoji } from '../components/Emoji.jsx'
import './DebatesView.css'

const POLL_INTERVAL_MS = 3000
const MAX_LENGTH = 1500

export function DebatesView() {
  const { user } = useAuth()
  const notify = useNotify()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [locked, setLocked] = useState(false)
  const [moderationOpen, setModerationOpen] = useState(false)
  const lastIdRef = useRef(0)
  const listRef = useRef(null)

  const loadState = () => getForumState().then((s) => setLocked(s.locked))

  useEffect(() => {
    listDebateMessages().then((initial) => {
      setMessages(initial)
      if (initial.length) lastIdRef.current = initial[initial.length - 1].id
    })
    loadState()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newer = await listDebateMessages(lastIdRef.current)
        if (newer.length) {
          setMessages((prev) => [...prev, ...newer])
          lastIdRef.current = newer[newer.length - 1].id
        }
      } catch {
        // silencioso: próxima tentativa em POLL_INTERVAL_MS
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const isOwnMessage = (msg) =>
    (msg.isAdmin && user.isAdmin) || (!msg.isAdmin && !user.isAdmin && msg.user?.id === user.id)

  const canType = !locked || user.isAdmin

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || sending || !canType) return
    if (trimmed.length > MAX_LENGTH) {
      notify(`Limite de ${MAX_LENGTH} caracteres atingido.`)
      return
    }
    setSending(true)
    try {
      const sent = await sendDebateMessage(trimmed)
      setMessages((prev) => [...prev, sent])
      lastIdRef.current = sent.id
      setDraft('')
    } catch (err) {
      notify(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDebateMessage(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <div className="debates-view">
      {user.isAdmin && (
        <div className="debates-view__admin-bar">
          <button type="button" onClick={() => setModerationOpen(true)}>
            Moderar fórum
          </button>
        </div>
      )}

      <div className="debates-view__list" ref={listRef}>
        {messages.map((msg) => {
          const own = isOwnMessage(msg)
          const senderLabel = msg.isAdmin ? 'Administração' : msg.user?.name || 'Aluno'
          return (
            <div key={msg.id} className={`debate-message${own ? ' debate-message--own' : ''}`}>
              <div className="debate-message__sender">
                {!msg.isAdmin && msg.user?.emoji && <Emoji text={msg.user.emoji} />} {senderLabel}
              </div>
              <div className="debate-message__bubble">
                {own && <span className="debate-message__timestamp">{formatDebateTimestamp(msg.createdAt)}</span>}
                <span className="debate-message__text">{msg.body}</span>
                {!own && <span className="debate-message__timestamp">{formatDebateTimestamp(msg.createdAt)}</span>}
                {user.isAdmin && (
                  <button
                    type="button"
                    className="debate-message__delete"
                    onClick={() => handleDelete(msg.id)}
                    aria-label="Excluir mensagem"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <form className="debates-view__composer" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={canType ? 'Escreva sua mensagem' : 'Trancado'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_LENGTH}
          disabled={!canType}
          className={!canType ? 'debates-view__input--locked' : ''}
        />
        <button type="submit" disabled={!draft.trim() || sending || !canType} aria-label="Enviar mensagem">
          ➤
        </button>
      </form>

      {moderationOpen && (
        <ModerationPanel
          locked={locked}
          onLockChange={setLocked}
          onClose={() => setModerationOpen(false)}
        />
      )}
    </div>
  )
}
