import { useEffect, useState } from 'react'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { ToggleSwitch } from '../components/ToggleSwitch.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import { TreePickerDialog } from './TreePickerDialog.jsx'
import {
  setOpen,
  setRepresentationPool,
  runDraw,
  redrawOne,
  reassignParticipant,
  removeParticipant,
  setSpeakingOrder,
  setSpeakingOrderVisibility
} from '../api/simulations.js'
import './SimulationAdminControls.css'

export function SimulationAdminControls({ post, onRefresh }) {
  const notify = useNotify()
  const sim = post.simulation
  const [poolPickerOpen, setPoolPickerOpen] = useState(false)
  const [removingUserId, setRemovingUserId] = useState(null)
  const [reassigningUserId, setReassigningUserId] = useState(null)
  const [orderDraft, setOrderDraft] = useState(sim.participants.map((p) => p.userId))

  useEffect(() => {
    setOrderDraft(sim.participants.map((p) => p.userId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.participants.map((p) => p.userId).join(',')])

  const handleToggleOpen = async (value) => {
    try {
      await setOpen(post.id, value)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleDraw = async () => {
    try {
      await runDraw(post.id)
      notify('Sorteio realizado.')
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleRedrawOne = async (userId) => {
    try {
      await redrawOne(post.id, userId)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleRemove = async () => {
    try {
      await removeParticipant(post.id, removingUserId)
      setRemovingUserId(null)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleReassign = async (representationNodeId) => {
    try {
      await reassignParticipant(post.id, reassigningUserId, representationNodeId)
      setReassigningUserId(null)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleSavePool = async (ids, priorityIds) => {
    try {
      await setRepresentationPool(post.id, ids, priorityIds)
      setPoolPickerOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const moveInOrder = (index, direction) => {
    setOrderDraft((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSaveOrder = async () => {
    try {
      await setSpeakingOrder(post.id, orderDraft)
      notify('Ordem de oradores salva.')
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleToggleOrderVisible = async (visible) => {
    try {
      await setSpeakingOrderVisibility(post.id, visible)
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const nameById = new Map(sim.participants.map((p) => [p.userId, p.name]))

  return (
    <div className="simulation-admin-controls">
      <h4>Administração da simulação</h4>

      <div className="simulation-admin-controls__row">
        <span>Simulação aberta para inscrições</span>
        <ToggleSwitch checked={sim.isOpen} onChange={handleToggleOpen} label="Simulação aberta" />
      </div>

      <button type="button" className="simulation-admin-controls__action" onClick={() => setPoolPickerOpen(true)}>
        Editar representações selecionadas ({sim.pool.length})
      </button>

      {sim.assignmentMode === 'draw' && (
        <button type="button" className="simulation-admin-controls__action" onClick={handleDraw}>
          Rodar sorteio para todos sem representação
        </button>
      )}

      {sim.participants.length > 0 && (
        <>
          <h4>Participantes</h4>
          <ul className="simulation-admin-controls__participants">
            {sim.participants.map((p) => (
              <li key={p.userId}>
                <span>
                  {p.name} — {p.representationName ?? 'sem representação'}
                </span>
                <span className="simulation-admin-controls__participant-actions">
                  <button type="button" onClick={() => setReassigningUserId(p.userId)}>
                    Trocar
                  </button>
                  <button type="button" onClick={() => handleRedrawOne(p.userId)}>
                    Resortear
                  </button>
                  <button type="button" onClick={() => setRemovingUserId(p.userId)}>
                    Remover
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {sim.participants.length > 0 && (
        <>
          <h4>
            Ordem de oradores
            <HelpHint text="Só pode ficar visível para os alunos depois que a simulação for encerrada." />
          </h4>
          <ol className="simulation-admin-controls__order">
            {orderDraft.map((userId, index) => (
              <li key={userId}>
                {nameById.get(userId)}
                <span>
                  <button type="button" onClick={() => moveInOrder(index, -1)} disabled={index === 0}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveInOrder(index, 1)} disabled={index === orderDraft.length - 1}>
                    ↓
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className="simulation-admin-controls__row">
            <button type="button" className="simulation-admin-controls__action" onClick={handleSaveOrder}>
              Salvar ordem
            </button>
            <ToggleSwitch
              checked={sim.speakingOrderVisible}
              onChange={handleToggleOrderVisible}
              label="Ordem de oradores visível"
            />
          </div>
        </>
      )}

      {poolPickerOpen && (
        <TreePickerDialog
          source="representations"
          mode="multi"
          title="Editar representações selecionadas"
          initialSelectedIds={sim.pool.map((p) => p.id)}
          initialPriorityIds={sim.pool.filter((p) => p.isPriority).map((p) => p.id)}
          onCancel={() => setPoolPickerOpen(false)}
          onConfirm={handleSavePool}
        />
      )}

      {reassigningUserId && (
        <TreePickerDialog
          source="representations"
          mode="single-leaf"
          title="Escolher nova representação"
          onCancel={() => setReassigningUserId(null)}
          onConfirm={(id) => handleReassign(id)}
        />
      )}

      {removingUserId && (
        <ConfirmDialog
          message="Tem certeza que quer remover esse participante da simulação?"
          onConfirm={handleRemove}
          onCancel={() => setRemovingUserId(null)}
        />
      )}
    </div>
  )
}
