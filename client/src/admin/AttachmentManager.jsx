import { useEffect, useState } from 'react'
import { listAttachments, uploadAttachment, deleteAttachment, attachmentUrl } from '../api/attachments.js'
import { useNotify } from '../notifications/NotificationContext.jsx'
import './AttachmentManager.css'

const MAX_ATTACHMENTS = 5

export function AttachmentManager({ postId }) {
  const [attachments, setAttachments] = useState(null)
  const [uploading, setUploading] = useState(false)
  const notify = useNotify()

  const load = () => listAttachments(postId).then(setAttachments).catch((err) => notify(err.message))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      await uploadAttachment(postId, file)
      load()
    } catch (err) {
      notify(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (attachmentId) => {
    try {
      await deleteAttachment(postId, attachmentId)
      load()
    } catch (err) {
      notify(err.message)
    }
  }

  if (!attachments) return null
  const atLimit = attachments.length >= MAX_ATTACHMENTS

  return (
    <div className="attachment-manager">
      <div className="attachment-manager__label">
        Anexos ({attachments.length}/{MAX_ATTACHMENTS})
      </div>

      {attachments.length === 0 ? (
        <p className="attachment-manager__empty">Nenhum anexo ainda.</p>
      ) : (
        <ul className="attachment-manager__list">
          {attachments.map((a) => (
            <li key={a.id}>
              <a href={attachmentUrl(postId, a.id)} target="_blank" rel="noopener noreferrer">
                {a.filename}
              </a>
              <button type="button" onClick={() => handleDelete(a.id)} aria-label={`Remover ${a.filename}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className={`attachment-manager__upload${atLimit ? ' attachment-manager__upload--disabled' : ''}`}>
        {uploading ? 'Enviando...' : 'Adicionar anexo'}
        <input type="file" onChange={handleFileChange} disabled={atLimit || uploading} hidden />
      </label>
    </div>
  )
}
