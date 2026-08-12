import { useEffect, useState } from 'react'
import { listAttachments, attachmentUrl } from '../api/attachments.js'
import './AttachmentList.css'

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png'])

export function AttachmentList({ postId }) {
  const [attachments, setAttachments] = useState(null)

  useEffect(() => {
    listAttachments(postId)
      .then(setAttachments)
      .catch(() => setAttachments([]))
  }, [postId])

  if (!attachments) return null
  if (attachments.length === 0) return <p className="post-detail__placeholder">Nenhum anexo.</p>

  return (
    <ul className="post-detail__attachments-list">
      {attachments.map((a) =>
        IMAGE_MIME_TYPES.has(a.mimeType) ? (
          <li key={a.id} className="attachment-list__image-item">
            <a href={attachmentUrl(postId, a.id)} target="_blank" rel="noopener noreferrer">
              <img src={attachmentUrl(postId, a.id)} alt={a.filename} className="attachment-list__image" />
            </a>
          </li>
        ) : (
          <li key={a.id}>
            <a href={attachmentUrl(postId, a.id)} target="_blank" rel="noopener noreferrer" className="formatted-link">
              {a.filename}
            </a>
          </li>
        )
      )}
    </ul>
  )
}
