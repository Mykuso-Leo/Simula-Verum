import { Router } from 'express'
import bcrypt from 'bcrypt'
import { db } from '../db/index.js'

export const adminRouter = Router()

adminRouter.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const trimmedUsername = typeof username === 'string' ? username.trim() : ''
  const trimmedPassword = typeof password === 'string' ? password.trim() : ''

  if (trimmedUsername.length < 3 || trimmedPassword.length < 3) {
    return res.status(400).json({ error: 'Usuário ou senha incorretos.' })
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(trimmedUsername)
  const valid = admin && bcrypt.compareSync(trimmedPassword, admin.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' })
  }

  req.session.isAdmin = true
  req.session.adminUsername = admin.username
  delete req.session.userId
  res.json({ isAdmin: true, username: admin.username })
})
