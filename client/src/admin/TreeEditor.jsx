import { useEffect, useState } from 'react'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { Emoji } from '../components/Emoji.jsx'
import './TreeEditor.css'

export function TreeEditor({ fetchTree, createNode, updateNode, deleteNode, withEmoji }) {
  const [tree, setTree] = useState(null)
  const [addingRoot, setAddingRoot] = useState(false)
  const [newRootName, setNewRootName] = useState('')
  const notify = useNotify()

  const load = () => fetchTree().then(setTree).catch((err) => notify(err.message))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddRoot = async () => {
    if (!newRootName.trim()) return
    try {
      await createNode({ parentId: null, name: newRootName.trim(), type: 'folder' })
      setNewRootName('')
      setAddingRoot(false)
      load()
    } catch (err) {
      notify(err.message)
    }
  }

  if (!tree) return null

  return (
    <div className="tree-editor">
      <ul className="tree-editor__root-list">
        {tree.map((node) => (
          <TreeEditorNode
            key={node.id}
            node={node}
            onChange={load}
            createNode={createNode}
            updateNode={updateNode}
            deleteNode={deleteNode}
            withEmoji={withEmoji}
            notify={notify}
          />
        ))}
      </ul>
      <div className="tree-editor__add">
        {addingRoot ? (
          <span className="tree-editor__edit-row">
            <input placeholder="Nome da pasta" value={newRootName} onChange={(e) => setNewRootName(e.target.value)} />
            <button type="button" onClick={handleAddRoot}>
              Adicionar
            </button>
            <button type="button" onClick={() => setAddingRoot(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setAddingRoot(true)}>
            + Nova pasta de topo
          </button>
        )}
      </div>
    </div>
  )
}

function TreeEditorNode({ node, onChange, createNode, updateNode, deleteNode, withEmoji, notify }) {
  const [expanded, setExpanded] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(node.name)
  const [emojiDraft, setEmojiDraft] = useState(node.emoji || '')
  const [adding, setAdding] = useState(null)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleRename = async () => {
    try {
      await updateNode(node.id, { name: nameDraft, ...(withEmoji ? { emoji: emojiDraft } : {}) })
      setRenaming(false)
      onChange()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      await createNode({ parentId: node.id, name: newName.trim(), type: adding, ...(withEmoji && adding === 'leaf' ? { emoji: newEmoji } : {}) })
      setNewName('')
      setNewEmoji('')
      setAdding(null)
      setExpanded(true)
      onChange()
    } catch (err) {
      notify(err.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteNode(node.id)
      setConfirmingDelete(false)
      onChange()
    } catch (err) {
      notify(err.message)
    }
  }

  if (node.type === 'leaf') {
    return (
      <li className="tree-editor__leaf">
        {renaming ? (
          <span className="tree-editor__edit-row">
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            {withEmoji && (
              <input
                value={emojiDraft}
                onChange={(e) => setEmojiDraft(e.target.value)}
                className="tree-editor__emoji-input"
                maxLength={8}
              />
            )}
            <button type="button" onClick={handleRename}>
              Salvar
            </button>
            <button type="button" onClick={() => setRenaming(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <span className="tree-editor__row">
            <span className="tree-editor__label">
              {node.emoji && <Emoji text={node.emoji} />} {node.name}
            </span>
            <button type="button" onClick={() => setRenaming(true)} aria-label="Renomear">
              ✎
            </button>
            <button type="button" onClick={() => setConfirmingDelete(true)} aria-label="Excluir">
              🗑
            </button>
          </span>
        )}
        {confirmingDelete && (
          <ConfirmDialog
            message={`Você tem certeza que quer excluir "${node.name}"?`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </li>
    )
  }

  return (
    <li className="tree-editor__folder">
      {renaming ? (
        <span className="tree-editor__edit-row">
          <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
          <button type="button" onClick={handleRename}>
            Salvar
          </button>
          <button type="button" onClick={() => setRenaming(false)}>
            Cancelar
          </button>
        </span>
      ) : (
        <span className="tree-editor__row">
          <button type="button" className="tree-editor__toggle" onClick={() => setExpanded((e) => !e)}>
            {expanded ? '▾' : '▸'} {node.name}
          </button>
          <button type="button" onClick={() => setRenaming(true)} aria-label="Renomear">
            ✎
          </button>
          <button type="button" onClick={() => setConfirmingDelete(true)} aria-label="Excluir">
            🗑
          </button>
        </span>
      )}

      {expanded && (
        <div className="tree-editor__children">
          <ul>
            {node.children.map((child) => (
              <TreeEditorNode
                key={child.id}
                node={child}
                onChange={onChange}
                createNode={createNode}
                updateNode={updateNode}
                deleteNode={deleteNode}
                withEmoji={withEmoji}
                notify={notify}
              />
            ))}
          </ul>
          <div className="tree-editor__add">
            {adding ? (
              <span className="tree-editor__edit-row">
                <input placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
                {withEmoji && adding === 'leaf' && (
                  <input
                    placeholder="Emoji"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="tree-editor__emoji-input"
                    maxLength={8}
                  />
                )}
                <button type="button" onClick={handleAdd}>
                  Adicionar
                </button>
                <button type="button" onClick={() => setAdding(null)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <>
                <button type="button" onClick={() => setAdding('folder')}>
                  + Pasta
                </button>
                <button type="button" onClick={() => setAdding('leaf')}>
                  + Item
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          message={`Você tem certeza que quer excluir "${node.name}" e tudo dentro dela?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </li>
  )
}
