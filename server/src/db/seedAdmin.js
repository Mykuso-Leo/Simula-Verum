import bcrypt from 'bcrypt'
import { db } from './index.js'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'simulaverum'

const { n } = db.prepare('SELECT COUNT(*) AS n FROM admins').get()
if (n === 0) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(ADMIN_USERNAME, hash)
  console.log('Conta de administrador padrão criada (admin/simulaverum).')
}
