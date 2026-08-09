import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { upload, MAX_ATTACHMENTS_PER_POST } from '../uploads.js'

export const attachmentsRouter = Router({ mergeParams: true })

attachmentsRouter.use(requireAuth)

attachmentsRouter.get('/', (req, res) => {
  const rows = db
    .prepare(
      'SELECT id, filename, mime_type AS mimeType, size_bytes AS sizeBytes, uploaded_at AS uploadedAt FROM post_attachments WHERE post_id = ? ORDER BY uploaded_at ASC'
    )
    .all(req.params.id)
  res.json(rows)
})

attachmentsRouter.get('/:attachmentId', (req, res) => {
  const row = db.prepare('SELECT * FROM post_attachments WHERE id = ? AND post_id = ?').get(req.params.attachmentId, req.params.id)
  if (!row) return res.status(404).json({ error: 'Anexo não encontrado.' })
  res.setHeader('Content-Type', row.mime_type)
  res.sendFile(path.resolve(row.stored_path))
})

attachmentsRouter.post(
  '/',
  requireAdmin,
  (req, res, next) => {
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })

    const { count } = db.prepare('SELECT COUNT(*) AS count FROM post_attachments WHERE post_id = ?').get(req.params.id)
    if (count >= MAX_ATTACHMENTS_PER_POST) {
      return res.status(400).json({ error: `Limite de ${MAX_ATTACHMENTS_PER_POST} anexos por post atingido.` })
    }
    next()
  },
  (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'O arquivo passa do limite de 8MB. Use uma plataforma como Google Drive ou OneDrive e anexe o link.'
          })
        }
        if (err.message === 'TIPO_INVALIDO') {
          return res.status(400).json({ error: 'Tipo de arquivo não permitido. Envie imagens ou documentos comuns.' })
        }
        return res.status(400).json({ error: 'Não foi possível enviar o arquivo.' })
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' })
      }

      const info = db
        .prepare(
          'INSERT INTO post_attachments (post_id, filename, stored_path, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)'
        )
        .run(req.params.id, req.file.originalname, req.file.path, req.file.mimetype, req.file.size)

      res.status(201).json({
        id: info.lastInsertRowid,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size
      })
    })
  }
)

attachmentsRouter.delete('/:attachmentId', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM post_attachments WHERE id = ? AND post_id = ?').get(req.params.attachmentId, req.params.id)
  if (!row) return res.status(404).json({ error: 'Anexo não encontrado.' })
  db.prepare('DELETE FROM post_attachments WHERE id = ?').run(row.id)
  fs.unlink(row.stored_path, () => {})
  res.json({ ok: true })
})
