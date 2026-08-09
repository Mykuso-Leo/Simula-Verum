import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { validateDateText } from '../utils/dateText.js'
import { getSimulationDetail } from './simulationHelpers.js'

export const postsRouter = Router()

const SIMULATION_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'dark_gray', 'light_gray']

postsRouter.use(requireAuth)

postsRouter.get('/', (req, res) => {
  const posts = db
    .prepare(
      `SELECT id, type, title, body, color, pinned_order, created_at, updated_at
       FROM posts
       ORDER BY pinned_order IS NULL, pinned_order ASC, created_at DESC`
    )
    .all()
  res.json(posts.map(toListItem))
})

postsRouter.get('/:id', (req, res) => {
  const detail = getPostDetail(req.params.id)
  if (!detail) return res.status(404).json({ error: 'Post não encontrado.' })
  res.json(detail)
})

postsRouter.post('/', requireAdmin, (req, res) => {
  const { type, title, body } = req.body ?? {}
  const trimmedTitle = typeof title === 'string' ? title.trim() : ''
  const trimmedBody = typeof body === 'string' ? body.trim() : ''
  if (!trimmedTitle || !trimmedBody) {
    return res.status(400).json({ error: 'Título e texto são obrigatórios.' })
  }

  if (type === 'text') {
    const info = db.prepare('INSERT INTO posts (type, title, body) VALUES (?, ?, ?)').run('text', trimmedTitle, trimmedBody)
    db.prepare('INSERT INTO post_history (post_id, action) VALUES (?, ?)').run(info.lastInsertRowid, 'created')
    return res.status(201).json(getPostDetail(info.lastInsertRowid))
  }

  if (type === 'simulation') {
    const { color } = req.body ?? {}
    if (color && !SIMULATION_COLORS.includes(color)) {
      return res.status(400).json({ error: 'Cor inválida.' })
    }

    const specs = validateSimulationSpecs(req.body ?? {})
    if (specs.error) return res.status(400).json({ error: specs.error })

    const info = db
      .prepare('INSERT INTO posts (type, title, body, color) VALUES (?, ?, ?, ?)')
      .run('simulation', trimmedTitle, trimmedBody, color ?? null)
    const postId = info.lastInsertRowid

    db.prepare(
      `INSERT INTO simulation_details
         (post_id, committee_node_id, date_text, duration_minutes, speech_time_minutes, max_representatives, assignment_mode, autofill_on_overflow, autofill_source_node_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      postId,
      specs.committeeNodeId,
      specs.dateText,
      specs.durationMinutes,
      specs.speechTimeMinutes,
      specs.maxRepresentatives,
      specs.assignmentMode,
      specs.autofillOnOverflow ? 1 : 0,
      specs.autofillSourceNodeId
    )

    db.prepare('INSERT INTO post_history (post_id, action) VALUES (?, ?)').run(postId, 'created')
    return res.status(201).json(getPostDetail(postId))
  }

  return res.status(400).json({ error: 'Tipo de post inválido.' })
})

postsRouter.patch('/:id', requireAdmin, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post não encontrado.' })

  const { title, body, color } = req.body ?? {}
  const trimmedTitle = typeof title === 'string' ? title.trim() : post.title
  const trimmedBody = typeof body === 'string' ? body.trim() : post.body
  if (!trimmedTitle || !trimmedBody) {
    return res.status(400).json({ error: 'Título e texto são obrigatórios.' })
  }
  if (color !== undefined && color !== null && !SIMULATION_COLORS.includes(color)) {
    return res.status(400).json({ error: 'Cor inválida.' })
  }

  db.prepare("UPDATE posts SET title = ?, body = ?, color = COALESCE(?, color), updated_at = datetime('now') WHERE id = ?").run(
    trimmedTitle,
    trimmedBody,
    color ?? null,
    post.id
  )

  if (post.type === 'simulation') {
    const specs = validateSimulationSpecs(req.body ?? {}, { partial: true })
    if (specs.error) return res.status(400).json({ error: specs.error })

    db.prepare(
      `UPDATE simulation_details SET
         committee_node_id = COALESCE(?, committee_node_id),
         date_text = CASE WHEN ? THEN ? ELSE date_text END,
         duration_minutes = COALESCE(?, duration_minutes),
         speech_time_minutes = COALESCE(?, speech_time_minutes),
         max_representatives = COALESCE(?, max_representatives),
         assignment_mode = COALESCE(?, assignment_mode),
         autofill_on_overflow = COALESCE(?, autofill_on_overflow),
         autofill_source_node_id = COALESCE(?, autofill_source_node_id)
       WHERE post_id = ?`
    ).run(
      specs.committeeNodeId,
      specs.dateTextProvided ? 1 : 0,
      specs.dateText,
      specs.durationMinutes,
      specs.speechTimeMinutes,
      specs.maxRepresentatives,
      specs.assignmentMode,
      specs.autofillOnOverflow === undefined ? null : specs.autofillOnOverflow ? 1 : 0,
      specs.autofillSourceNodeId,
      post.id
    )
  }

  db.prepare('INSERT INTO post_history (post_id, action) VALUES (?, ?)').run(post.id, 'edited')
  res.json(getPostDetail(post.id))
})

postsRouter.post('/:id/pin', requireAdmin, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
  if (post.pinned_order) return res.json(getPostDetail(post.id))

  const used = db
    .prepare('SELECT pinned_order FROM posts WHERE pinned_order IS NOT NULL')
    .all()
    .map((r) => r.pinned_order)
  const nextSlot = [1, 2, 3].find((n) => !used.includes(n))
  if (!nextSlot) {
    return res.status(400).json({ error: 'Máximo de 3 posts fixados atingido.' })
  }

  db.prepare('UPDATE posts SET pinned_order = ? WHERE id = ?').run(nextSlot, post.id)
  res.json(getPostDetail(post.id))
})

postsRouter.post('/:id/unpin', requireAdmin, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
  db.prepare('UPDATE posts SET pinned_order = NULL WHERE id = ?').run(post.id)
  res.json(getPostDetail(post.id))
})

postsRouter.patch('/:id/open', requireAdmin, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post || post.type !== 'simulation') return res.status(404).json({ error: 'Simulação não encontrada.' })

  const { isOpen } = req.body ?? {}
  db.prepare('UPDATE simulation_details SET is_open = ? WHERE post_id = ?').run(isOpen ? 1 : 0, post.id)
  res.json(getPostDetail(post.id))
})

postsRouter.delete('/:id', requireAdmin, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id)
  res.json({ ok: true })
})

export function getPostDetail(id) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  if (!post) return null
  const history = db
    .prepare('SELECT action, detail, created_at FROM post_history WHERE post_id = ? ORDER BY created_at ASC')
    .all(post.id)
  const base = { ...toListItem(post), body: post.body, history }
  if (post.type === 'simulation') {
    return { ...base, simulation: getSimulationDetail(post.id) }
  }
  return base
}

function toListItem(post) {
  const item = {
    id: post.id,
    type: post.type,
    title: post.title,
    preview: post.type === 'text' ? firstLine(post.body) : undefined,
    color: post.color,
    pinned: post.pinned_order !== null,
    createdAt: post.created_at
  }
  if (post.type === 'simulation') {
    const details = db.prepare('SELECT is_open FROM simulation_details WHERE post_id = ?').get(post.id)
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM simulation_participants WHERE post_id = ?').get(post.id)
    item.isOpen = !!details?.is_open
    item.participantCount = n
  }
  return item
}

function firstLine(body) {
  const line = body.split('\n')[0]
  return line.length > 140 ? `${line.slice(0, 140)}…` : line
}

function validateSimulationSpecs(payload, { partial = false } = {}) {
  const result = {
    committeeNodeId: null,
    dateText: null,
    dateTextProvided: false,
    durationMinutes: null,
    speechTimeMinutes: null,
    maxRepresentatives: null,
    assignmentMode: null,
    autofillOnOverflow: undefined,
    autofillSourceNodeId: null
  }

  if (payload.committeeNodeId !== undefined) {
    result.committeeNodeId = payload.committeeNodeId === null ? null : Number(payload.committeeNodeId)
  }

  if (payload.dateText !== undefined) {
    result.dateTextProvided = true
    if (payload.dateText === null || payload.dateText === '') {
      result.dateText = null
    } else {
      const validation = validateDateText(payload.dateText)
      if (!validation.valid) return { error: validation.error }
      result.dateText = payload.dateText
    }
  }

  if (payload.durationMinutes !== undefined) result.durationMinutes = payload.durationMinutes
  if (payload.speechTimeMinutes !== undefined) result.speechTimeMinutes = payload.speechTimeMinutes
  if (payload.maxRepresentatives !== undefined) result.maxRepresentatives = payload.maxRepresentatives

  if (payload.assignmentMode !== undefined) {
    if (!['first_come', 'draw'].includes(payload.assignmentMode)) {
      return { error: 'Modo de designação inválido.' }
    }
    result.assignmentMode = payload.assignmentMode
  } else if (!partial) {
    result.assignmentMode = 'draw'
  }

  if (payload.autofillOnOverflow !== undefined) result.autofillOnOverflow = !!payload.autofillOnOverflow
  else if (!partial) result.autofillOnOverflow = true

  if (payload.autofillSourceNodeId !== undefined) {
    result.autofillSourceNodeId = payload.autofillSourceNodeId === null ? null : Number(payload.autofillSourceNodeId)
  }

  return result
}
