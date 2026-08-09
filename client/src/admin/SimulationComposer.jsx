import { useState } from 'react'
import { createPost } from '../api/posts.js'
import { setRepresentationPool } from '../api/simulations.js'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import { ToggleSwitch } from '../components/ToggleSwitch.jsx'
import { AttachmentManager } from './AttachmentManager.jsx'
import { TreePickerDialog } from './TreePickerDialog.jsx'
import { SIMULATION_COLORS } from '../theme/simulationColors.js'
import './PostComposer.css'
import './SimulationComposer.css'

const FORMAT_HELP =
  'Use *texto* para itálico, **texto** para negrito e _texto_ para sublinhado. Links começando com http:// ou https:// ficam sublinhados e azuis automaticamente.'

export function SimulationComposer({ onCancel, onDone }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState(null)
  const [committee, setCommittee] = useState(null)
  const [dateText, setDateText] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [speechTimeMinutes, setSpeechTimeMinutes] = useState('')
  const [maxRepresentatives, setMaxRepresentatives] = useState('')
  const [assignmentMode, setAssignmentMode] = useState('draw')
  const [autofillOnOverflow, setAutofillOnOverflow] = useState(true)
  const [autofillSource, setAutofillSource] = useState(null)
  const [pool, setPool] = useState({ ids: [], priorityIds: [] })
  const [pickerOpen, setPickerOpen] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdPostId, setCreatedPostId] = useState(null)
  const notify = useNotify()

  const isValid = title.trim().length > 0 && body.trim().length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      const created = await createPost({
        type: 'simulation',
        title: title.trim(),
        body: body.trim(),
        color,
        committeeNodeId: committee?.id ?? null,
        dateText: dateText || null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        speechTimeMinutes: speechTimeMinutes ? Number(speechTimeMinutes) : null,
        maxRepresentatives: maxRepresentatives ? Number(maxRepresentatives) : null,
        assignmentMode,
        autofillOnOverflow,
        autofillSourceNodeId: autofillSource?.id ?? null
      })

      if (pool.ids.length > 0) {
        await setRepresentationPool(created.id, pool.ids, pool.priorityIds)
      }

      setCreatedPostId(created.id)
    } catch (err) {
      notify(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (createdPostId) {
    return (
      <div className="post-composer__backdrop" onClick={onDone}>
        <div className="post-composer" onClick={(e) => e.stopPropagation()}>
          <h3>Simulação publicada!</h3>
          <p className="post-composer__hint">Você pode anexar arquivos agora, ou concluir.</p>
          <AttachmentManager postId={createdPostId} />
          <div className="post-composer__actions">
            <button type="button" className="post-composer__submit" onClick={onDone}>
              Concluir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="post-composer__backdrop" onClick={onCancel}>
      <form className="post-composer simulation-composer" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Nova simulação</h3>

        <input
          className="post-composer__title"
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="post-composer__body-label">
          <span>Texto</span>
          <HelpHint text={FORMAT_HELP} />
        </div>
        <textarea
          className="post-composer__body"
          placeholder="Descreva a simulação..."
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="simulation-composer__field">
          <span className="simulation-composer__label">Cor do post</span>
          <div className="simulation-composer__colors">
            {SIMULATION_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`simulation-composer__color${color === c.id ? ' simulation-composer__color--active' : ''}`}
                style={{ background: c.hex }}
                title={c.label}
                onClick={() => setColor(c.id === color ? null : c.id)}
              />
            ))}
          </div>
        </div>

        <div className="simulation-composer__field">
          <span className="simulation-composer__label">Comitê</span>
          <button type="button" className="simulation-composer__picker-btn" onClick={() => setPickerOpen('committee')}>
            {committee ? committee.name : 'Selecionar comitê (opcional)'}
          </button>
        </div>

        <label className="simulation-composer__field">
          <span className="simulation-composer__label">Data (DD/MM, opcional)</span>
          <input
            type="text"
            placeholder="Ex: 25/09"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            className="simulation-composer__input"
          />
        </label>

        <div className="simulation-composer__row">
          <label className="simulation-composer__field">
            <span className="simulation-composer__label">Duração total (minutos)</span>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="simulation-composer__input"
            />
          </label>
          <label className="simulation-composer__field">
            <span className="simulation-composer__label">Tempo de discurso (min)</span>
            <input
              type="number"
              min="0"
              value={speechTimeMinutes}
              onChange={(e) => setSpeechTimeMinutes(e.target.value)}
              className="simulation-composer__input"
            />
          </label>
        </div>

        <label className="simulation-composer__field">
          <span className="simulation-composer__label">Quantidade máxima de representantes</span>
          <input
            type="number"
            min="1"
            value={maxRepresentatives}
            onChange={(e) => setMaxRepresentatives(e.target.value)}
            className="simulation-composer__input"
          />
        </label>

        <div className="simulation-composer__field simulation-composer__toggle-row">
          <span className="simulation-composer__label">
            Modo sorteio (em vez de ordem de chegada)
            <HelpHint text="Ordem de chegada: quem entrar primeiro escolhe a representação. Sorteio: todos apenas sinalizam interesse e as representações são sorteadas quando o admin encerrar as inscrições." />
          </span>
          <ToggleSwitch
            checked={assignmentMode === 'draw'}
            onChange={(v) => setAssignmentMode(v ? 'draw' : 'first_come')}
            label="Modo sorteio"
          />
        </div>

        <div className="simulation-composer__field simulation-composer__toggle-row">
          <span className="simulation-composer__label">
            Preencher automaticamente se as vagas acabarem
            <HelpHint text="Se alguém tentar entrar depois que todas as representações do pool já estiverem em uso, o site sorteia uma nova automaticamente da pasta escolhida abaixo e adiciona ao pool." />
          </span>
          <ToggleSwitch checked={autofillOnOverflow} onChange={setAutofillOnOverflow} label="Autofill" />
        </div>

        {autofillOnOverflow && (
          <div className="simulation-composer__field">
            <span className="simulation-composer__label">Pasta para sortear em caso de excedente</span>
            <button type="button" className="simulation-composer__picker-btn" onClick={() => setPickerOpen('autofill')}>
              {autofillSource ? autofillSource.name : 'Selecionar pasta'}
            </button>
          </div>
        )}

        <div className="simulation-composer__field">
          <span className="simulation-composer__label">Representações selecionadas</span>
          <button type="button" className="simulation-composer__picker-btn" onClick={() => setPickerOpen('pool')}>
            {pool.ids.length > 0 ? `${pool.ids.length} selecionada(s)` : 'Selecionar representações'}
          </button>
        </div>

        <div className="post-composer__actions">
          <button type="button" className="post-composer__cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="post-composer__submit" disabled={!isValid || submitting}>
            Publicar
          </button>
        </div>
      </form>

      {pickerOpen === 'committee' && (
        <TreePickerDialog
          source="committees"
          mode="single-leaf"
          title="Selecionar comitê"
          initialSelectedIds={committee?.id ?? null}
          onCancel={() => setPickerOpen(null)}
          onConfirm={(id, name) => {
            setCommittee(id ? { id, name } : null)
            setPickerOpen(null)
          }}
        />
      )}

      {pickerOpen === 'autofill' && (
        <TreePickerDialog
          source="representations"
          mode="single-folder"
          title="Selecionar pasta de sorteio automático"
          initialSelectedIds={autofillSource?.id ?? null}
          onCancel={() => setPickerOpen(null)}
          onConfirm={(id, name) => {
            setAutofillSource(id ? { id, name } : null)
            setPickerOpen(null)
          }}
        />
      )}

      {pickerOpen === 'pool' && (
        <TreePickerDialog
          source="representations"
          mode="multi"
          title="Selecionar representações disponíveis"
          initialSelectedIds={pool.ids}
          initialPriorityIds={pool.priorityIds}
          onCancel={() => setPickerOpen(null)}
          onConfirm={(ids, priorityIds) => {
            setPool({ ids, priorityIds })
            setPickerOpen(null)
          }}
        />
      )}
    </div>
  )
}
