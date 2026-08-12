import { Router } from 'express'
import fs from 'node:fs'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { restoreTree } from '../db/seedTree.js'
import { uploadsDir } from '../uploads.js'

export const adminDataRouter = Router()

adminDataRouter.use(requireAuth, requireAdmin)

adminDataRouter.get('/storage', (req, res) => {
  const dbSizeBytes = fs.existsSync(db.name) ? fs.statSync(db.name).size : 0
  const uploadsSizeBytes = dirSize(uploadsDir)
  res.json({ dbSizeBytes, uploadsSizeBytes, totalBytes: dbSizeBytes + uploadsSizeBytes })
})

adminDataRouter.get('/user-log', (req, res) => {
  const rows = db.prepare('SELECT name, created_at AS createdAt FROM users ORDER BY created_at DESC').all()
  res.json(rows)
})

adminDataRouter.post('/restore-database', (req, res) => {
  const { answer } = req.body ?? {}
  if (answer !== 'Tales') {
    return res.status(400).json({ error: 'Resposta incorreta.' })
  }
  restoreTree()
  res.json({ ok: true })
})

function dirSize(dir) {
  if (!fs.existsSync(dir)) return 0
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = `${dir}/${entry.name}`
    total += entry.isDirectory() ? dirSize(fullPath) : fs.statSync(fullPath).size
  }
  return total
}
