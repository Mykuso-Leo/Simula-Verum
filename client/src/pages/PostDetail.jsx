import { useEffect, useState } from 'react'
import { getPost } from '../api/posts.js'
import { formatHistoryEntry } from '../utils/postTimestamp.js'
import { parseFormattedText } from '../utils/formatText.jsx'
import { AttachmentList } from './AttachmentList.jsx'
import { SimulationSection } from './SimulationSection.jsx'
import './PostDetail.css'

export function PostDetail({ postId, onBack }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  const reload = () => getPost(postId).then(setPost).catch((err) => setError(err.message))

  useEffect(() => {
    setPost(null)
    setError(null)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  if (error) return <p className="post-detail__error">{error}</p>
  if (!post) return null

  return (
    <div className="post-detail">
      <button type="button" className="post-detail__back" onClick={onBack}>
        ← Voltar
      </button>
      <span className="post-detail__tag">{post.type === 'text' ? 'Texto' : 'Simulação'}</span>
      <h2 className="post-detail__title">{post.title}</h2>
      <p className="post-detail__body">{parseFormattedText(post.body)}</p>

      {post.type === 'simulation' && <SimulationSection post={post} onRefresh={reload} />}

      <section className="post-detail__section">
        <h4>Anexos</h4>
        <AttachmentList postId={post.id} />
      </section>

      <section className="post-detail__section">
        <h4>Histórico</h4>
        {post.history.length === 0 ? (
          <p className="post-detail__placeholder">Sem histórico.</p>
        ) : (
          <ul className="post-detail__history">
            {post.history.map((entry, i) => (
              <li key={i}>{formatHistoryEntry(entry)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
