import { useEffect, useState } from 'react'
import {
  getStorage,
  getUserLog,
  restoreDatabase,
  createRepresentationNode,
  updateRepresentationNode,
  deleteRepresentationNode,
  createCommitteeNode,
  updateCommitteeNode,
  deleteCommitteeNode
} from '../api/adminData.js'
import { getRepresentationsTree, getCommitteesTree } from '../api/simulations.js'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { TreeEditor } from './TreeEditor.jsx'
import './DataPanel.css'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatLogTimestamp(sqliteDatetime) {
  const date = new Date(`${sqliteDatetime.replace(' ', 'T')}Z`)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()} às ${hours}:${minutes}`
}

export function DataPanel() {
  const [storage, setStorage] = useState(null)
  const [userLog, setUserLog] = useState(null)
  const [restoreStep, setRestoreStep] = useState(null)
  const [answer, setAnswer] = useState('')
  const notify = useNotify()

  useEffect(() => {
    getStorage().then(setStorage).catch(() => {})
    getUserLog().then(setUserLog).catch(() => {})
  }, [])

  const handleRestore = async () => {
    try {
      await restoreDatabase(answer)
      notify('Banco de representações e comitês restaurado ao estado inicial.')
      setRestoreStep(null)
      setAnswer('')
      window.location.reload()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <div className="data-panel">
      <h2>Dados</h2>

      {storage && (
        <div className="data-panel__storage">
          <p className="data-panel__storage-total">Uso de armazenamento: {formatBytes(storage.totalBytes)}</p>
          <p className="data-panel__storage-detail">
            Banco de dados: {formatBytes(storage.dbSizeBytes)} · Anexos: {formatBytes(storage.uploadsSizeBytes)}
          </p>
        </div>
      )}

      <h3>Contas registradas</h3>
      {!userLog ? null : userLog.length === 0 ? (
        <p className="data-panel__empty">Nenhuma conta registrada ainda.</p>
      ) : (
        <ul className="data-panel__user-log">
          {userLog.map((u) => (
            <li key={u.name}>
              <span className="data-panel__user-log-name">{u.name}</span>
              <span className="data-panel__user-log-date">{formatLogTimestamp(u.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}

      <h3>Representações</h3>
      <TreeEditor
        fetchTree={getRepresentationsTree}
        createNode={createRepresentationNode}
        updateNode={updateRepresentationNode}
        deleteNode={deleteRepresentationNode}
        withEmoji
      />

      <h3>Comitês</h3>
      <TreeEditor
        fetchTree={getCommitteesTree}
        createNode={createCommitteeNode}
        updateNode={updateCommitteeNode}
        deleteNode={deleteCommitteeNode}
        withEmoji={false}
      />

      <div className="data-panel__restore">
        {restoreStep === 'question' ? (
          <div className="data-panel__restore-question">
            <p>Qual a melhor turma de 2026?</p>
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Resposta" />
            <div className="data-panel__restore-actions">
              <button type="button" onClick={() => setRestoreStep(null)}>
                Cancelar
              </button>
              <button type="button" onClick={handleRestore}>
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="data-panel__restore-btn" onClick={() => setRestoreStep('question')}>
            Restaurar todo o banco de dados
          </button>
        )}
      </div>
    </div>
  )
}
