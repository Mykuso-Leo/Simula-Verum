import session from 'express-session'

export class SqliteSessionStore extends session.Store {
  constructor(db) {
    super()
    this.db = db
  }

  get(sid, callback) {
    try {
      const row = this.db.prepare('SELECT sess, expires FROM sessions WHERE sid = ?').get(sid)
      if (!row || row.expires < Date.now()) return callback(null, null)
      callback(null, JSON.parse(row.sess))
    } catch (err) {
      callback(err)
    }
  }

  set(sid, sess, callback) {
    try {
      const expires = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 1000 * 60 * 60 * 24 * 30
      this.db
        .prepare(
          `INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?)
           ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires`
        )
        .run(sid, JSON.stringify(sess), expires)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  }

  destroy(sid, callback) {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback)
  }
}
