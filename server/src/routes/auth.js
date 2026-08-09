import { Router } from 'express'
import { db } from '../db/index.js'

export const authRouter = Router()

authRouter.get('/me', (req, res) => {
  if (req.session.isAdmin) {
    return res.json({ isAdmin: true, username: req.session.adminUsername })
  }
  if (req.session.userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId)
    if (user) return res.json(toPublicUser(user))
  }
  res.status(401).json({ error: 'Não autenticado.' })
})

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    emoji: user.emoji,
    autoEmojiEnabled: !!user.auto_emoji_enabled,
    theme: user.theme,
    isAdmin: false
  }
}
