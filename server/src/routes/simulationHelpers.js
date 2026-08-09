import { db } from '../db/index.js'

export function getSimulationDetail(postId) {
  const details = db.prepare('SELECT * FROM simulation_details WHERE post_id = ?').get(postId)
  if (!details) return null

  const committee = details.committee_node_id
    ? db.prepare('SELECT id, name FROM committee_nodes WHERE id = ?').get(details.committee_node_id)
    : null

  const pool = db
    .prepare(
      `SELECT sar.representation_node_id AS id, rn.name, rn.emoji, sar.is_priority AS isPriority
       FROM simulation_available_representations sar
       JOIN representation_nodes rn ON rn.id = sar.representation_node_id
       WHERE sar.post_id = ?
       ORDER BY rn.name ASC`
    )
    .all(postId)

  const participants = db
    .prepare(
      `SELECT sp.user_id AS userId, u.name, u.emoji AS userEmoji,
              sp.representation_node_id AS representationId, rn.name AS representationName, rn.emoji AS representationEmoji,
              sp.joined_at AS joinedAt
       FROM simulation_participants sp
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN representation_nodes rn ON rn.id = sp.representation_node_id
       WHERE sp.post_id = ?
       ORDER BY sp.joined_at ASC`
    )
    .all(postId)

  const takenIds = new Set(participants.filter((p) => p.representationId).map((p) => p.representationId))
  const poolAvailableCount = pool.filter((p) => !takenIds.has(p.id)).length

  let speakingOrder = null
  if (details.speaking_order_visible) {
    speakingOrder = db
      .prepare(
        `SELECT so.user_id AS userId, u.name, so.position
         FROM speaking_order so JOIN users u ON u.id = so.user_id
         WHERE so.post_id = ? ORDER BY so.position ASC`
      )
      .all(postId)
  }

  return {
    committee: committee ? { id: committee.id, name: committee.name } : null,
    dateText: details.date_text,
    durationMinutes: details.duration_minutes,
    speechTimeMinutes: details.speech_time_minutes,
    maxRepresentatives: details.max_representatives,
    isOpen: !!details.is_open,
    assignmentMode: details.assignment_mode,
    autofillOnOverflow: !!details.autofill_on_overflow,
    autofillSourceNodeId: details.autofill_source_node_id,
    speakingOrderVisible: !!details.speaking_order_visible,
    pool,
    participantCount: participants.length,
    poolAvailableCount,
    participants,
    speakingOrder
  }
}

export function maybeUpdateUserEmoji(userId, nodeId) {
  if (!nodeId) return
  const user = db.prepare('SELECT auto_emoji_enabled FROM users WHERE id = ?').get(userId)
  if (!user?.auto_emoji_enabled) return
  const node = db.prepare('SELECT emoji FROM representation_nodes WHERE id = ?').get(nodeId)
  if (node?.emoji) {
    db.prepare("UPDATE users SET emoji = ?, updated_at = datetime('now') WHERE id = ?").run(node.emoji, userId)
  }
}

export function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickRandomUnusedLeaf(postId, parentId) {
  const leaves = db.prepare(`SELECT id, name, emoji FROM representation_nodes WHERE parent_id = ? AND type = 'leaf'`).all(parentId)
  const used = new Set(
    db
      .prepare('SELECT representation_node_id FROM simulation_available_representations WHERE post_id = ?')
      .all(postId)
      .map((r) => r.representation_node_id)
  )
  const candidates = leaves.filter((l) => !used.has(l.id))
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}
