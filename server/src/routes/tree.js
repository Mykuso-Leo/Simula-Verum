import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

export const treeRouter = Router()

treeRouter.use(requireAuth)

treeRouter.get('/representations', (req, res) => {
  res.json(buildTree('representation_nodes', true))
})

treeRouter.get('/committees', (req, res) => {
  res.json(buildTree('committee_nodes', false))
})

treeRouter.post('/representations', requireAdmin, (req, res) => handleCreate(req, res, 'representation_nodes', true))
treeRouter.patch('/representations/:id', requireAdmin, (req, res) => handleUpdate(req, res, 'representation_nodes', true))
treeRouter.delete('/representations/:id', requireAdmin, (req, res) => handleDelete(req, res, 'representation_nodes'))

treeRouter.post('/committees', requireAdmin, (req, res) => handleCreate(req, res, 'committee_nodes', false))
treeRouter.patch('/committees/:id', requireAdmin, (req, res) => handleUpdate(req, res, 'committee_nodes', false))
treeRouter.delete('/committees/:id', requireAdmin, (req, res) => handleDelete(req, res, 'committee_nodes'))

function handleCreate(req, res, table, withEmoji) {
  const { parentId, name, type, emoji } = req.body ?? {}
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  if (!trimmedName) return res.status(400).json({ error: 'Nome é obrigatório.' })
  if (!['folder', 'leaf'].includes(type)) return res.status(400).json({ error: 'Tipo inválido.' })

  if (withEmoji) {
    const info = db
      .prepare(`INSERT INTO ${table} (parent_id, name, type, emoji, sort_order) VALUES (?, ?, ?, ?, 0)`)
      .run(parentId ?? null, trimmedName, type, emoji || null)
    return res.status(201).json({ id: info.lastInsertRowid })
  }
  const info = db
    .prepare(`INSERT INTO ${table} (parent_id, name, type, sort_order) VALUES (?, ?, ?, 0)`)
    .run(parentId ?? null, trimmedName, type)
  res.status(201).json({ id: info.lastInsertRowid })
}

function handleUpdate(req, res, table, withEmoji) {
  const { name, emoji } = req.body ?? {}
  const updates = []
  const params = []
  if (name !== undefined) {
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    if (!trimmedName) return res.status(400).json({ error: 'Nome é obrigatório.' })
    updates.push('name = ?')
    params.push(trimmedName)
  }
  if (withEmoji && emoji !== undefined) {
    updates.push('emoji = ?')
    params.push(emoji || null)
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Nada para atualizar.' })

  params.push(req.params.id)
  const info = db.prepare(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  if (info.changes === 0) return res.status(404).json({ error: 'Item não encontrado.' })
  res.json({ ok: true })
}

function handleDelete(req, res, table) {
  try {
    const info = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id)
    if (info.changes === 0) return res.status(404).json({ error: 'Item não encontrado.' })
    res.json({ ok: true })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Esse item está em uso em uma simulação e não pode ser excluído.' })
    }
    throw err
  }
}

function buildTree(table, withEmoji) {
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY sort_order ASC`).all()
  const byParent = new Map()
  for (const row of rows) {
    const key = row.parent_id ?? 'root'
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(row)
  }

  function attach(nodes) {
    return nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      ...(withEmoji ? { emoji: n.emoji } : {}),
      children: n.type === 'folder' ? attach(byParent.get(n.id) ?? []) : undefined
    }))
  }

  return attach(byParent.get('root') ?? [])
}
