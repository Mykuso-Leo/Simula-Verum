import { useMemo, useState } from 'react'
import { Emoji } from '../components/Emoji.jsx'
import './PoolJoinPicker.css'

const SEARCH_THRESHOLD = 20

export function PoolJoinPicker({ availableItems, onCancel, onConfirm }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return availableItems
    const q = search.trim().toLowerCase()
    return availableItems.filter((item) => item.name.toLowerCase().includes(q))
  }, [availableItems, search])

  return (
    <div className="pool-join-picker__backdrop" onClick={onCancel}>
      <div className="pool-join-picker" onClick={(e) => e.stopPropagation()}>
        <h3>Escolha sua representação</h3>

        {availableItems.length >= SEARCH_THRESHOLD && (
          <input
            type="text"
            className="pool-join-picker__search"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        <ul className="pool-join-picker__list">
          {filtered.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="radio"
                  name="pool-item"
                  checked={selectedId === item.id}
                  onChange={() => setSelectedId(item.id)}
                />
                {item.emoji && <Emoji text={item.emoji} />} {item.name}
              </label>
            </li>
          ))}
          {filtered.length === 0 && <li className="pool-join-picker__empty">Nada encontrado.</li>}
        </ul>

        <div className="pool-join-picker__actions">
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" disabled={!selectedId} onClick={() => onConfirm(selectedId)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
