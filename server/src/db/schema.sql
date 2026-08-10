CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '',
  auto_emoji_enabled INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT 'white',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expires INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('text', 'simulation')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  color TEXT,
  pinned_order INTEGER CHECK(pinned_order IN (1, 2, 3)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS debate_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  is_admin INTEGER NOT NULL DEFAULT 0,
  body TEXT NOT NULL,
  emoji TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  locked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS spam_penalties (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  cooldown_until TEXT
);

CREATE TABLE IF NOT EXISTS representation_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES representation_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('folder', 'leaf')),
  emoji TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS committee_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES committee_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('folder', 'leaf')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS simulation_details (
  post_id INTEGER PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  committee_node_id INTEGER REFERENCES committee_nodes(id) ON DELETE SET NULL,
  date_text TEXT,
  duration_minutes INTEGER,
  speech_time_minutes INTEGER,
  max_representatives INTEGER,
  is_open INTEGER NOT NULL DEFAULT 1,
  assignment_mode TEXT NOT NULL DEFAULT 'draw' CHECK (assignment_mode IN ('first_come', 'draw')),
  autofill_on_overflow INTEGER NOT NULL DEFAULT 1,
  autofill_source_node_id INTEGER REFERENCES representation_nodes(id) ON DELETE SET NULL,
  speaking_order_visible INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS simulation_available_representations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  representation_node_id INTEGER NOT NULL REFERENCES representation_nodes(id) ON DELETE CASCADE,
  is_priority INTEGER NOT NULL DEFAULT 0,
  UNIQUE (post_id, representation_node_id)
);

CREATE TABLE IF NOT EXISTS simulation_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  representation_node_id INTEGER REFERENCES representation_nodes(id) ON DELETE SET NULL,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (post_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sim_participant_representation
  ON simulation_participants (post_id, representation_node_id)
  WHERE representation_node_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS speaking_order (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
