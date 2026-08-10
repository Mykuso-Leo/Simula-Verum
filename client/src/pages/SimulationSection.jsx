import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { joinSimulation } from '../api/simulations.js'
import { PoolJoinPicker } from './PoolJoinPicker.jsx'
import { SimulationAdminControls } from '../admin/SimulationAdminControls.jsx'
import { Emoji } from '../components/Emoji.jsx'
import './SimulationSection.css'

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')} h`
}

function formatAvailableList(names) {
  if (names.length === 0) return null
  if (names.length === 1) return `A representação disponível é: ${names[0]}.`
  const allButLast = names.slice(0, -1).join(', ')
  const last = names[names.length - 1]
  return `As representações disponíveis são: ${allButLast} e ${last}.`
}

export function SimulationSection({ post, onRefresh }) {
  const { user } = useAuth()
  const notify = useNotify()
  const [showAllNames, setShowAllNames] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const sim = post.simulation

  const myParticipation = user.isAdmin ? null : sim.participants.find((p) => p.userId === user.id)

  const names = sim.pool.map((p) => p.name)
  const visibleNames = showAllNames ? names : names.slice(0, 20)
  const availableSentence = formatAvailableList(visibleNames)

  const handleJoinDraw = async () => {
    try {
      await joinSimulation(post.id)
      notify('Inscrição feita! Aguarde o sorteio.')
      onRefresh()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleJoinFirstCome = async (representationNodeId) => {
    try {
      await joinSimulation(post.id, representationNodeId)
      setPickerOpen(false)
      onRefresh()
    } catch (err) {
      notify(err.message)
      setPickerOpen(false)
    }
  }

  const takenIds = new Set(sim.participants.filter((p) => p.representationId).map((p) => p.representationId))
  const availableItems = sim.pool.filter((p) => !takenIds.has(p.id))

  return (
    <section className="simulation-section">
      <h4>Especificações</h4>
      <ul className="simulation-section__specs">
        {sim.committee && <li>Comitê: {sim.committee.name}</li>}
        {sim.dateText && <li>Data: {sim.dateText}</li>}
        {sim.durationMinutes != null && <li>Duração total: {formatDuration(sim.durationMinutes)}</li>}
        {sim.speechTimeMinutes != null && <li>Tempo de discurso: {sim.speechTimeMinutes} min</li>}
        {sim.maxRepresentatives != null && <li>Máximo de representantes: {sim.maxRepresentatives}</li>}
        {availableSentence && (
          <li>
            {availableSentence}{' '}
            {names.length > 20 && (
              <button type="button" className="simulation-section__see-more" onClick={() => setShowAllNames((s) => !s)}>
                {showAllNames ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </li>
        )}
      </ul>

      {!user.isAdmin && sim.isOpen && !myParticipation && (
        <div className="simulation-section__join">
          {sim.assignmentMode === 'draw' ? (
            <button type="button" className="simulation-section__join-btn" onClick={handleJoinDraw}>
              Participar (sorteio)
            </button>
          ) : (
            <button type="button" className="simulation-section__join-btn" onClick={() => setPickerOpen(true)}>
              Escolher representação
            </button>
          )}
        </div>
      )}

      {!user.isAdmin && myParticipation && (
        <p className="simulation-section__my-participation">
          Você está inscrito como:{' '}
          {myParticipation.representationName ? (
            <>
              {myParticipation.representationEmoji && <Emoji text={myParticipation.representationEmoji} />}{' '}
              {myParticipation.representationName}
            </>
          ) : (
            'aguardando sorteio'
          )}
        </p>
      )}

      <h4>Lista de participantes ({sim.participantCount})</h4>
      {sim.participants.length === 0 ? (
        <p className="simulation-section__placeholder">Ninguém inscrito ainda.</p>
      ) : (
        <ul className="simulation-section__participants">
          {sim.participants.map((p) => (
            <li key={p.userId}>
              {p.name} —{' '}
              {p.representationName ? (
                <>
                  {p.representationEmoji && <Emoji text={p.representationEmoji} />} {p.representationName}
                </>
              ) : (
                'aguardando sorteio'
              )}
            </li>
          ))}
        </ul>
      )}

      {sim.speakingOrder && (
        <>
          <h4>Ordem de oradores</h4>
          <ol className="simulation-section__speaking-order">
            {sim.speakingOrder.map((s) => (
              <li key={s.userId}>{s.name}</li>
            ))}
          </ol>
        </>
      )}

      {user.isAdmin && <SimulationAdminControls post={post} onRefresh={onRefresh} />}

      {pickerOpen && (
        <PoolJoinPicker availableItems={availableItems} onCancel={() => setPickerOpen(false)} onConfirm={handleJoinFirstCome} />
      )}
    </section>
  )
}
