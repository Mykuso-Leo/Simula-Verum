import { Router } from 'express'
import { db } from '../db/index.js'
import { toPublicUser } from './auth.js'
import { isValidEmoji } from '../utils/emoji.js'

const NAME_REGEX = /^[\p{L}\s]+$/u
const VALID_THEME_IDS = ['white', 'black', 'dark_blue', 'light_blue', 'yellow', 'green', 'purple', 'red']

export const usersRouter = Router()

usersRouter.post('/login', (req, res) => {
  const { name } = req.body ?? {}
  const trimmed = typeof name === 'string' ? name.trim() : ''

  if (trimmed.length < 3 || !NAME_REGEX.test(trimmed)) {
    return res.status(400).json({ error: 'O nome deve ter ao menos 3 letras.' })
  }

  let user = db.prepare('SELECT * FROM users WHERE name = ?').get(trimmed)
  if (!user) {
    const info = db.prepare('INSERT INTO users (name) VALUES (?)').run(trimmed)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  }

  req.session.userId = user.id
  delete req.session.isAdmin
  delete req.session.adminUsername
  res.json(toPublicUser(user))
})

usersRouter.patch('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' })

  const { theme, emoji, autoEmojiEnabled } = req.body ?? {}
  const updates = []
  const params = []

  if (theme !== undefined) {
    if (!VALID_THEME_IDS.includes(theme)) return res.status(400).json({ error: 'Tema inválido.' })
    updates.push('theme = ?')
    params.push(theme)
  }
  if (emoji !== undefined) {
    if (!isValidEmoji(emoji)) {
      return res.status(400).json({ error: 'Isso não é um emoji válido. Escolha um emoji no seletor.' })
    }
    updates.push('emoji = ?')
    params.push(emoji)
  }
  if (autoEmojiEnabled !== undefined) {
    updates.push('auto_emoji_enabled = ?')
    params.push(autoEmojiEnabled ? 1 : 0)
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nada para atualizar.' })
  }

  updates.push("updated_at = datetime('now')")
  params.push(req.session.userId)
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId)
  res.json(toPublicUser(user))
})
