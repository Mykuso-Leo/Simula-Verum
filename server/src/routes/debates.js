import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

export const debatesRouter = Router()

debatesRouter.use(requireAuth)

const MAX_MESSAGE_LENGTH = 1500
const SPAM_WINDOW_MS = 10 * 1000
const SPAM_COOLDOWN_MS = 5 * 1000
const SHORT_MESSAGE_THRESHOLD = 100
const SHORT_MESSAGE_REPEAT_LIMIT = 5
const LONG_MESSAGE_REPEAT_LIMIT = 3

const PURGE_WINDOWS = {
  week: 7,
  month: 30,
  '3months': 90
}

debatesRouter.get('/messages', (req, res) => {
  const since = req.query.since ? Number(req.query.since) : null
  const rows = since
    ? db.prepare(SELECT_MESSAGES_SINCE).all(since)
    : db.prepare(SELECT_RECENT_MESSAGES).all().reverse()
  res.json(rows.map(toMessageDTO))
})

debatesRouter.get('/penalties', requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT sp.user_id, u.name, sp.cooldown_until
       FROM spam_penalties sp JOIN users u ON u.id = sp.user_id
       WHERE sp.cooldown_until > datetime('now')`
    )
    .all()
  res.json(rows.map((r) => ({ userId: r.user_id, name: r.name, cooldownUntil: r.cooldown_until })))
})

debatesRouter.post('/penalties/:userId/clear', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM spam_penalties WHERE user_id = ?').run(req.params.userId)
  res.json({ ok: true })
})

debatesRouter.post('/lock', requireAdmin, (req, res) => {
  db.prepare('UPDATE forum_state SET locked = 1 WHERE id = 1').run()
  res.json({ locked: true })
})

debatesRouter.post('/unlock', requireAdmin, (req, res) => {
  db.prepare('UPDATE forum_state SET locked = 0 WHERE id = 1').run()
  res.json({ locked: false })
})

debatesRouter.get('/state', (req, res) => {
  const state = db.prepare('SELECT locked FROM forum_state WHERE id = 1').get()
  res.json({ locked: !!state?.locked })
})

debatesRouter.get('/message-counts', requireAdmin, (req, res) => {
  const counts = {}
  for (const [key, days] of Object.entries(PURGE_WINDOWS)) {
    const row = db
      .prepare(`SELECT COUNT(*) AS count FROM debate_messages WHERE created_at < datetime('now', '-${days} days')`)
      .get()
    counts[key] = row.count
  }
  res.json(counts)
})

debatesRouter.post('/purge', requireAdmin, (req, res) => {
  const { olderThan } = req.body ?? {}
  const days = PURGE_WINDOWS[olderThan]
  if (!days) return res.status(400).json({ error: 'Período inválido.' })

  const info = db
    .prepare(`DELETE FROM debate_messages WHERE created_at < datetime('now', '-${days} days')`)
    .run()

  if (info.changes === 0) {
    return res.status(400).json({ error: `Não há mensagens há mais de ${purgeLabel(olderThan)}.` })
  }
  res.json({ deletedCount: info.changes })
})

debatesRouter.delete('/messages/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM debate_messages WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Mensagem não encontrada.' })
  res.json({ ok: true })
})

debatesRouter.post('/messages', (req, res) => {
  const isAdmin = !!req.session.isAdmin
  const userId = isAdmin ? null : req.session.userId

  const state = db.prepare('SELECT locked FROM forum_state WHERE id = 1').get()
  if (state?.locked && !isAdmin) {
    return res.status(403).json({ error: 'O fórum está trancado.' })
  }

  if (!isAdmin) {
    const penalty = db.prepare('SELECT cooldown_until FROM spam_penalties WHERE user_id = ?').get(userId)
    if (penalty?.cooldown_until && penalty.cooldown_until > sqliteNow()) {
      return res.status(429).json({ error: 'Aguarde alguns segundos antes de enviar outra mensagem.' })
    }
  }

  const { body } = req.body ?? {}
  const trimmed = typeof body === 'string' ? body.trim() : ''
  if (!trimmed) return res.status(400).json({ error: 'Escreva uma mensagem.' })
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Limite de ${MAX_MESSAGE_LENGTH} caracteres atingido.` })
  }

  const info = db
    .prepare('INSERT INTO debate_messages (user_id, is_admin, body) VALUES (?, ?, ?)')
    .run(userId, isAdmin ? 1 : 0, trimmed)

  if (!isAdmin) {
    applySpamPenaltyIfNeeded(userId, trimmed)
  }

  const row = db.prepare(SELECT_MESSAGE_BY_ID).get(info.lastInsertRowid)
  res.status(201).json(toMessageDTO(row))
})

const SELECT_FIELDS = `
  dm.id, dm.body, dm.created_at, dm.is_admin,
  u.id AS user_id, u.name AS user_name, u.emoji AS user_emoji
`
const SELECT_RECENT_MESSAGES = `SELECT ${SELECT_FIELDS} FROM debate_messages dm LEFT JOIN users u ON u.id = dm.user_id ORDER BY dm.id DESC LIMIT 100`
const SELECT_MESSAGES_SINCE = `SELECT ${SELECT_FIELDS} FROM debate_messages dm LEFT JOIN users u ON u.id = dm.user_id WHERE dm.id > ? ORDER BY dm.id ASC`
const SELECT_MESSAGE_BY_ID = `SELECT ${SELECT_FIELDS} FROM debate_messages dm LEFT JOIN users u ON u.id = dm.user_id WHERE dm.id = ?`

function toMessageDTO(row) {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    isAdmin: !!row.is_admin,
    user: row.is_admin ? null : { id: row.user_id, name: row.user_name, emoji: row.user_emoji }
  }
}

function sqliteNow() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function applySpamPenaltyIfNeeded(userId, latestBody) {
  const windowStart = new Date(Date.now() - SPAM_WINDOW_MS).toISOString().slice(0, 19).replace('T', ' ')
  const recent = db
    .prepare(`SELECT body FROM debate_messages WHERE user_id = ? AND is_admin = 0 AND created_at >= ? ORDER BY id DESC`)
    .all(userId, windowStart)

  const normalizedLatest = normalize(latestBody)
  const matchCount = recent.filter((r) => normalize(r.body) === normalizedLatest).length
  const limit = latestBody.length < SHORT_MESSAGE_THRESHOLD ? SHORT_MESSAGE_REPEAT_LIMIT : LONG_MESSAGE_REPEAT_LIMIT

  if (matchCount >= limit) {
    const cooldownUntil = new Date(Date.now() + SPAM_COOLDOWN_MS).toISOString().slice(0, 19).replace('T', ' ')
    db.prepare(
      `INSERT INTO spam_penalties (user_id, cooldown_until) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET cooldown_until = excluded.cooldown_until`
    ).run(userId, cooldownUntil)
  }
}

function purgeLabel(key) {
  return { week: '1 semana', month: '1 mês', '3months': '3 meses' }[key] || key
}
