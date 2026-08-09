import { useEffect, useState } from 'react'
import { listPosts, deletePost, getPost } from '../api/posts.js'
import { formatPostTimestamp } from '../utils/postTimestamp.js'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { PostComposer } from './PostComposer.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import './EditPostsPanel.css'

export function EditPostsPanel({ onClose, onChanged }) {
  const [posts, setPosts] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [deletingPost, setDeletingPost] = useState(null)
  const notify = useNotify()

  const load = () => listPosts().then(setPosts).catch((err) => notify(err.message))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditClick = async (post) => {
    try {
      const detail = await getPost(post.id)
      setEditingPost(detail)
    } catch (err) {
      notify(err.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deletePost(deletingPost.id)
      setDeletingPost(null)
      load()
      onChanged()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <div className="edit-posts-panel__backdrop" onClick={onClose}>
      <div className="edit-posts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="edit-posts-panel__header">
          <h3>Editar posts</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {!posts ? null : posts.length === 0 ? (
          <p className="edit-posts-panel__empty">Nenhum post ainda.</p>
        ) : (
          <ul className="edit-posts-panel__list">
            {posts.map((post) => (
              <li key={post.id} className="edit-posts-panel__item">
                <div className="edit-posts-panel__info">
                  <span className="edit-posts-panel__tag">{post.type === 'text' ? 'Texto' : 'Simulação'}</span>
                  <span className="edit-posts-panel__title">{post.title}</span>
                  <span className="edit-posts-panel__timestamp">{formatPostTimestamp(post.createdAt)}</span>
                </div>
                <div className="edit-posts-panel__actions">
                  {post.type === 'text' && (
                    <button type="button" onClick={() => handleEditClick(post)} aria-label="Editar post">
                      ✎
                    </button>
                  )}
                  <button type="button" onClick={() => setDeletingPost(post)} aria-label="Excluir post">
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingPost && (
        <PostComposer
          mode="edit"
          postId={editingPost.id}
          initialTitle={editingPost.title}
          initialBody={editingPost.body}
          onCancel={() => setEditingPost(null)}
          onDone={() => {
            setEditingPost(null)
            load()
            onChanged()
          }}
        />
      )}

      {deletingPost && (
        <ConfirmDialog
          message={`Você tem certeza que quer excluir "${deletingPost.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPost(null)}
        />
      )}
    </div>
  )
}
