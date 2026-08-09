import { useEffect, useState } from 'react'
import { listAttachments, attachmentUrl } from '../api/attachments.js'

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
      {attachments.map((a) => (
        <li key={a.id}>
          <a href={attachmentUrl(postId, a.id)} target="_blank" rel="noopener noreferrer" className="formatted-link">
            {a.filename}
          </a>
        </li>
      ))}
    </ul>
  )
}
