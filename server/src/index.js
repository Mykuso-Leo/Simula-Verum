import express from 'express'
import session from 'express-session'
import { db } from './db/index.js'
import './db/seedAdmin.js'
import './db/seedTree.js'
import { SqliteSessionStore } from './sessionStore.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { adminRouter } from './routes/admin.js'
import { postsRouter } from './routes/posts.js'
import { attachmentsRouter } from './routes/attachments.js'
import { debatesRouter } from './routes/debates.js'
import { treeRouter } from './routes/tree.js'
import { simulationsRouter } from './routes/simulations.js'
import { adminDataRouter } from './routes/adminData.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use(
  session({
    store: new SqliteSessionStore(db),
    secret: process.env.SESSION_SECRET || 'simula-verum-dev-secret-troque-em-producao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax'
    }
  })
)

app.get('/api/health', (req, res) => {
  const row = db.prepare('SELECT 1 AS ok').get()
  res.json({ ok: row.ok === 1 })
})

app.use('/api', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/posts', postsRouter)
app.use('/api/posts/:id/attachments', attachmentsRouter)
app.use('/api/posts/:id', simulationsRouter)
app.use('/api/debates', debatesRouter)
app.use('/api/tree', treeRouter)
app.use('/api/admin', adminDataRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
