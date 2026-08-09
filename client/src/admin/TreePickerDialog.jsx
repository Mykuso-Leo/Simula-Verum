import { useEffect, useState } from 'react'
import { getRepresentationsTree, getCommitteesTree } from '../api/simulations.js'
import { TreeBrowser } from './TreeBrowser.jsx'
import './TreePickerDialog.css'

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

export function TreePickerDialog({
  source,
  mode,
  title,
  initialSelectedIds,
  initialPriorityIds,
  onCancel,
  onConfirm
}) {
  const [tree, setTree] = useState(null)
  const isMulti = mode === 'multi'
  const [selectedIds, setSelectedIds] = useState(isMulti ? new Set(initialSelectedIds ?? []) : initialSelectedIds ?? null)
  const [prioritySet, setPrioritySet] = useState(new Set(initialPriorityIds ?? []))
  const [selectedFolderId, setSelectedFolderId] = useState(mode === 'single-folder' ? initialSelectedIds ?? null : null)

  useEffect(() => {
    const fetcher = source === 'committees' ? getCommitteesTree : getRepresentationsTree
    fetcher().then(setTree)
  }, [source])

  const handleToggleLeaf = (id) => {
    if (mode === 'single-leaf') {
      setSelectedIds(id)
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTogglePriority = (id) => {
    setPrioritySet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirm = () => {
    if (mode === 'single-folder') {
      const node = selectedFolderId && tree ? findNode(tree, selectedFolderId) : null
      return onConfirm(selectedFolderId, node?.name ?? null)
    }
    if (mode === 'single-leaf') {
      const node = selectedIds && tree ? findNode(tree, selectedIds) : null
      return onConfirm(selectedIds, node?.name ?? null)
    }
    onConfirm(Array.from(selectedIds), Array.from(prioritySet))
  }

  return (
    <div className="tree-picker-dialog__backdrop" onClick={onCancel}>
      <div className="tree-picker-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="tree-picker-dialog__body">
          {!tree ? (
            <p>Carregando...</p>
          ) : (
            <TreeBrowser
              nodes={tree}
              mode={mode}
              selectedIds={selectedIds}
              onToggleLeaf={handleToggleLeaf}
              prioritySet={isMulti ? prioritySet : undefined}
              onTogglePriority={handleTogglePriority}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
            />
          )}
        </div>
        <div className="tree-picker-dialog__actions">
          <button type="button" className="tree-picker-dialog__cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="tree-picker-dialog__confirm" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
