import { useState } from 'react'
import './HelpHint.css'

export function HelpHint({ text }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="help-hint">
      <button
        type="button"
        className="help-hint__button"
        title={text}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-label="Ajuda"
      >
        ?
      </button>
      {open && <span className="help-hint__popover">{text}</span>}
    </span>
  )
}
