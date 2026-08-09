import { useEffect, useState } from 'react'
import { listPosts } from '../api/posts.js'
import { formatPostTimestamp } from '../utils/postTimestamp.js'
import './PostList.css'

export function PostList({ onSelect, isAdmin, onTogglePin }) {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="post-list__empty">{error}</p>
  if (!posts) return null
  if (posts.length === 0) return <p className="post-list__empty">Nenhum post ainda.</p>

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <button
            type="button"
            className="post-card__body"
            style={post.type === 'simulation' && post.color ? { borderLeft: `4px solid var(--sim-color-${post.color})` } : undefined}
            onClick={() => onSelect(post.id)}
          >
            <span className="post-card__tag">{post.type === 'text' ? 'Texto' : 'Simulação'}</span>
            <h3 className="post-card__title">
              {post.title}
              {post.type === 'simulation' && post.isOpen && <span className="post-card__active-dot" aria-label="Simulação ativa" />}
            </h3>
            {post.type === 'text' && post.preview && <p className="post-card__preview">{post.preview}</p>}
            {post.type === 'simulation' && (
              <p className="post-card__preview">{post.participantCount} pessoa(s) inscrita(s)</p>
            )}
            <span className="post-card__timestamp">{formatPostTimestamp(post.createdAt)}</span>
          </button>

          {isAdmin ? (
            <button
              type="button"
              className={`post-card__pin${post.pinned ? ' post-card__pin--active' : ''}`}
              onClick={() => onTogglePin(post)}
              aria-label={post.pinned ? 'Desfixar post' : 'Fixar post'}
              title={post.pinned ? 'Desfixar post' : 'Fixar post'}
            >
              📌
            </button>
          ) : (
            post.pinned && (
              <span className="post-card__pin post-card__pin--active post-card__pin--static" aria-hidden="true">
                📌
              </span>
            )
          )}
        </div>
      ))}
    </div>
  )
}
