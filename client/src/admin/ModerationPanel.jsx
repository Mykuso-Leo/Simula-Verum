import { useEffect, useState } from 'react'
import { lockForum, unlockForum, purgeDebateMessages, listPenalties, clearPenalty } from '../api/debates.js'
import { apiFetch } from '../api/api.js'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { ToggleSwitch } from '../components/ToggleSwitch.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import './ModerationPanel.css'

const PURGE_OPTIONS = [
  { key: 'week', label: 'Excluir mensagens de mais de 1 semana' },
  { key: 'month', label: 'Excluir mensagens de mais de 1 mês' },
  { key: '3months', label: 'Excluir mensagens de mais de 3 meses' }
]

export function ModerationPanel({ locked, onLockChange, onClose }) {
  const notify = useNotify()
  const [counts, setCounts] = useState(null)
  const [penalties, setPenalties] = useState(null)

  const loadCounts = () => apiFetch('/debates/message-counts').then(setCounts).catch(() => {})
  const loadPenalties = () => listPenalties().then(setPenalties).catch(() => {})

  useEffect(() => {
    loadCounts()
    loadPenalties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLockToggle = async (value) => {
    try {
      const result = value ? await lockForum() : await unlockForum()
      onLockChange(result.locked)
    } catch (err) {
      notify(err.message)
    }
  }

  const handlePurge = async (key) => {
    try {
      const result = await purgeDebateMessages(key)
      notify(`${result.deletedCount} mensagem(ns) excluída(s).`)
      loadCounts()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleClearPenalty = async (userId) => {
    try {
      await clearPenalty(userId)
      loadPenalties()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <div className="moderation-panel__backdrop" onClick={onClose}>
      <div className="moderation-panel" onClick={(e) => e.stopPropagation()}>
        <div className="moderation-panel__header">
          <h3>Moderação do fórum</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="moderation-panel__row">
          <span className="moderation-panel__row-label">
            Trancar fórum
            <HelpHint text="Quando trancado, só o administrador consegue enviar mensagens. Os alunos veem o campo de escrita desabilitado, com 'Trancado' no lugar de 'Escreva sua mensagem'." />
          </span>
          <ToggleSwitch checked={locked} onChange={handleLockToggle} label="Trancar fórum" />
        </div>

        <div className="moderation-panel__section">
          <h4>Excluir mensagens antigas</h4>
          {PURGE_OPTIONS.map((opt) => {
            const count = counts?.[opt.key] ?? null
            const empty = count === 0
            return (
              <button
                key={opt.key}
                type="button"
                className={`moderation-panel__purge${empty ? ' moderation-panel__purge--empty' : ''}`}
                onClick={() => handlePurge(opt.key)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="moderation-panel__section">
          <h4>Usuários com penalidade de spam ativa</h4>
          {!penalties ? null : penalties.length === 0 ? (
            <p className="moderation-panel__empty">Ninguém está penalizado agora.</p>
          ) : (
            <ul className="moderation-panel__penalties">
              {penalties.map((p) => (
                <li key={p.userId}>
                  <span>{p.name}</span>
                  <button type="button" onClick={() => handleClearPenalty(p.userId)}>
                    Remover penalidade
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
