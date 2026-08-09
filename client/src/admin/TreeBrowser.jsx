import { useState } from 'react'
import './TreeBrowser.css'

export function TreeBrowser({ nodes, mode, selectedIds, onToggleLeaf, prioritySet, onTogglePriority, selectedFolderId, onSelectFolder }) {
  return (
    <ul className="tree-browser__list">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          mode={mode}
          selectedIds={selectedIds}
          onToggleLeaf={onToggleLeaf}
          prioritySet={prioritySet}
          onTogglePriority={onTogglePriority}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </ul>
  )
}

function TreeNode({ node, mode, selectedIds, onToggleLeaf, prioritySet, onTogglePriority, selectedFolderId, onSelectFolder }) {
  const [expanded, setExpanded] = useState(false)

  if (node.type === 'folder') {
    return (
      <li>
        <div className="tree-browser__folder-row">
          <button type="button" className="tree-browser__expand" onClick={() => setExpanded((e) => !e)}>
            {expanded ? '▾' : '▸'} {node.name}
          </button>
          {mode === 'single-folder' && (
            <button
              type="button"
              className={`tree-browser__use-folder${selectedFolderId === node.id ? ' tree-browser__use-folder--active' : ''}`}
              onClick={() => onSelectFolder(node.id)}
            >
              {selectedFolderId === node.id ? 'Selecionada' : 'Usar esta pasta'}
            </button>
          )}
        </div>
        {expanded && node.children?.length > 0 && (
          <div className="tree-browser__children">
            <TreeBrowser
              nodes={node.children}
              mode={mode}
              selectedIds={selectedIds}
              onToggleLeaf={onToggleLeaf}
              prioritySet={prioritySet}
              onTogglePriority={onTogglePriority}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
            />
          </div>
        )}
      </li>
    )
  }

  if (mode === 'single-folder') return null

  const isSelected = mode === 'single-leaf' ? selectedIds === node.id : selectedIds.has(node.id)

  return (
    <li className="tree-browser__leaf-row">
      <label className="tree-browser__leaf-label">
        <input
          type={mode === 'single-leaf' ? 'radio' : 'checkbox'}
          checked={isSelected}
          onChange={() => onToggleLeaf(node.id)}
        />
        {node.emoji && <span>{node.emoji}</span>} {node.name}
      </label>
      {mode === 'multi' && isSelected && prioritySet && (
        <button
          type="button"
          className={`tree-browser__priority${prioritySet.has(node.id) ? ' tree-browser__priority--active' : ''}`}
          onClick={() => onTogglePriority(node.id)}
          title="Marcar como prioridade (sempre sorteado)"
        >
          ⭐
        </button>
      )}
    </li>
  )
}
