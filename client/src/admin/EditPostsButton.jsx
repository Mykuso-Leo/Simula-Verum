import { useState } from 'react'
import { EditPostsPanel } from './EditPostsPanel.jsx'
import './AdminFab.css'

export function EditPostsButton({ onChanged }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="admin-fab admin-fab--edit" onClick={() => setOpen(true)} aria-label="Editar posts">
        ✎
      </button>

      {open && <EditPostsPanel onClose={() => setOpen(false)} onChanged={onChanged} />}
    </>
  )
}
