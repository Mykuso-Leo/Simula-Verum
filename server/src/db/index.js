import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'simulaverum.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

db.prepare('INSERT OR IGNORE INTO forum_state (id, locked) VALUES (1, 0)').run()

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

// debate_messages.emoji guarda o emoji do usuário no momento do envio (snapshot),
// para não mudar retroativamente se o usuário trocar de emoji depois.
ensureColumn('debate_messages', 'emoji', 'TEXT')
db.exec(`
  UPDATE debate_messages
  SET emoji = (SELECT emoji FROM users WHERE users.id = debate_messages.user_id)
  WHERE emoji IS NULL AND is_admin = 0 AND user_id IS NOT NULL
`)
