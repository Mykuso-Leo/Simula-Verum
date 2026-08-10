import { useState } from 'react'
import { createPost, updatePost } from '../api/posts.js'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { HelpHint } from '../components/HelpHint.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { AttachmentManager } from './AttachmentManager.jsx'
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.jsx'
import './PostComposer.css'

const FORMAT_HELP =
  'Use *texto* para itálico, **texto** para negrito e _texto_ para sublinhado. Links começando com http:// ou https:// ficam sublinhados e azuis automaticamente.'

export function PostComposer({ mode, postId, initialTitle = '', initialBody = '', onCancel, onDone }) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [createdPostId, setCreatedPostId] = useState(null)
  const notify = useNotify()

  const isValid = title.trim().length > 0 && body.trim().length > 0

  const doSave = async () => {
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      if (mode === 'create') {
        const created = await createPost({ title: title.trim(), body: body.trim() })
        setCreatedPostId(created.id)
      } else {
        await updatePost(postId, { title: title.trim(), body: body.trim() })
        onDone()
      }
    } catch (err) {
      notify(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    if (mode === 'edit') {
      setConfirming(true)
    } else {
      doSave()
    }
  }

  if (mode === 'create' && createdPostId) {
    return (
      <div className="post-composer__backdrop" onClick={onDone}>
        <div className="post-composer" onClick={(e) => e.stopPropagation()}>
          <h3>Post publicado!</h3>
          <p className="post-composer__hint">Você pode anexar arquivos agora, ou concluir sem anexos.</p>
          <AttachmentManager postId={createdPostId} />
          <div className="post-composer__actions">
            <button type="button" className="post-composer__submit" onClick={onDone}>
              Concluir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="post-composer__backdrop" onClick={onCancel}>
      <form className="post-composer" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{mode === 'create' ? 'Novo post de texto' : 'Editar post'}</h3>

        <input
          className="post-composer__title"
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="post-composer__body-label">
          <span>Texto</span>
          <HelpHint text={FORMAT_HELP} />
        </div>
        <AutoResizeTextarea
          className="post-composer__body"
          placeholder="Escreva o conteúdo do post..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {mode === 'edit' && <AttachmentManager postId={postId} />}

        <div className="post-composer__actions">
          <button type="button" className="post-composer__cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="post-composer__submit" disabled={!isValid || submitting}>
            {mode === 'create' ? 'Publicar' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      {confirming && (
        <ConfirmDialog
          message="Você tem certeza que quer salvar essas alterações?"
          onConfirm={() => {
            setConfirming(false)
            doSave()
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
