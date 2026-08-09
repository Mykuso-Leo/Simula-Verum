import { useState } from 'react'
import { PostComposer } from './PostComposer.jsx'
import { SimulationComposer } from './SimulationComposer.jsx'
import './AdminFab.css'

export function CreatePostButton({ onCreated }) {
  const [choosingType, setChoosingType] = useState(false)
  const [composerType, setComposerType] = useState(null)

  const handleChooseType = (type) => {
    setChoosingType(false)
    setComposerType(type)
  }

  const closeComposer = () => setComposerType(null)
  const finishComposer = () => {
    setComposerType(null)
    onCreated()
  }

  return (
    <>
      <button
        type="button"
        className="admin-fab admin-fab--create"
        onClick={() => setChoosingType(true)}
        aria-label="Criar post"
      >
        +
      </button>

      {choosingType && (
        <div className="admin-fab__backdrop" onClick={() => setChoosingType(false)}>
          <div className="admin-fab__dropdown" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => handleChooseType('text')}>
              Texto
            </button>
            <button type="button" onClick={() => handleChooseType('simulation')}>
              Simulação
            </button>
          </div>
        </div>
      )}

      {composerType === 'text' && <PostComposer mode="create" onCancel={closeComposer} onDone={finishComposer} />}
      {composerType === 'simulation' && <SimulationComposer onCancel={closeComposer} onDone={finishComposer} />}
    </>
  )
}
