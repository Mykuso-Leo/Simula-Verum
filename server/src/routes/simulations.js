import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { getPostDetail } from './posts.js'
import { getSimulationDetail, maybeUpdateUserEmoji, shuffle, pickRandomUnusedLeaf } from './simulationHelpers.js'

export const simulationsRouter = Router({ mergeParams: true })

simulationsRouter.use(requireAuth)

function loadSimulationPost(req, res) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post || post.type !== 'simulation') {
    res.status(404).json({ error: 'Simulação não encontrada.' })
    return null
  }
  return post
}

simulationsRouter.patch('/representations', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const { nodeIds, priorityNodeIds } = req.body ?? {}
  if (!Array.isArray(nodeIds)) return res.status(400).json({ error: 'Lista de representações inválida.' })

  const priority = new Set(priorityNodeIds ?? [])
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM simulation_available_representations WHERE post_id = ?').run(post.id)
    const insert = db.prepare(
      'INSERT INTO simulation_available_representations (post_id, representation_node_id, is_priority) VALUES (?, ?, ?)'
    )
    for (const nodeId of nodeIds) {
      insert.run(post.id, nodeId, priority.has(nodeId) ? 1 : 0)
    }
  })
  tx()

  res.json(getPostDetail(post.id))
})

simulationsRouter.post('/join', (req, res) => {
  if (req.session.isAdmin) return res.status(400).json({ error: 'O administrador não participa de simulações.' })

  const post = loadSimulationPost(req, res)
  if (!post) return

  const details = db.prepare('SELECT * FROM simulation_details WHERE post_id = ?').get(post.id)
  if (!details.is_open) return res.status(400).json({ error: 'Essa simulação está fechada para inscrições.' })

  const userId = req.session.userId
  const existing = db.prepare('SELECT id FROM simulation_participants WHERE post_id = ? AND user_id = ?').get(post.id, userId)
  if (existing) return res.status(400).json({ error: 'Você já está inscrito nessa simulação.' })

  const { n: participantCount } = db.prepare('SELECT COUNT(*) AS n FROM simulation_participants WHERE post_id = ?').get(post.id)
  if (details.max_representatives && participantCount >= details.max_representatives) {
    return res.status(400).json({ error: 'Número máximo de representantes já atingido.' })
  }

  const { n: poolSize } = db
    .prepare('SELECT COUNT(*) AS n FROM simulation_available_representations WHERE post_id = ?')
    .get(post.id)

  if (participantCount >= poolSize) {
    if (!details.autofill_on_overflow) {
      return res
        .status(400)
        .json({ error: 'Vagas esgotadas. Entre em contato com o administrador para adicionar uma nova representação.' })
    }
    if (!details.autofill_source_node_id) {
      return res.status(400).json({
        error: 'Vagas esgotadas e nenhuma pasta de sorteio automático foi configurada. Entre em contato com o administrador.'
      })
    }
    const newLeaf = pickRandomUnusedLeaf(post.id, details.autofill_source_node_id)
    if (!newLeaf) {
      return res
        .status(400)
        .json({ error: 'Não há mais representações disponíveis na pasta configurada. Entre em contato com o administrador.' })
    }
    db.prepare('INSERT INTO simulation_available_representations (post_id, representation_node_id, is_priority) VALUES (?, ?, 0)').run(
      post.id,
      newLeaf.id
    )
    db.prepare('INSERT INTO simulation_participants (post_id, user_id, representation_node_id) VALUES (?, ?, ?)').run(
      post.id,
      userId,
      newLeaf.id
    )
    maybeUpdateUserEmoji(userId, newLeaf.id)
    return res.status(201).json({ ...getPostDetail(post.id), autofilled: newLeaf })
  }

  if (details.assignment_mode === 'first_come') {
    const { representationNodeId } = req.body ?? {}
    if (!representationNodeId) return res.status(400).json({ error: 'Escolha uma representação.' })

    const inPool = db
      .prepare('SELECT 1 FROM simulation_available_representations WHERE post_id = ? AND representation_node_id = ?')
      .get(post.id, representationNodeId)
    if (!inPool) return res.status(400).json({ error: 'Representação inválida para essa simulação.' })

    const taken = db
      .prepare('SELECT 1 FROM simulation_participants WHERE post_id = ? AND representation_node_id = ?')
      .get(post.id, representationNodeId)
    if (taken) return res.status(400).json({ error: 'Essa representação já foi escolhida por outra pessoa.' })

    try {
      db.prepare('INSERT INTO simulation_participants (post_id, user_id, representation_node_id) VALUES (?, ?, ?)').run(
        post.id,
        userId,
        representationNodeId
      )
    } catch {
      return res.status(400).json({ error: 'Essa representação já foi escolhida por outra pessoa.' })
    }
    maybeUpdateUserEmoji(userId, representationNodeId)
  } else {
    db.prepare('INSERT INTO simulation_participants (post_id, user_id, representation_node_id) VALUES (?, ?, NULL)').run(
      post.id,
      userId
    )
  }

  res.status(201).json(getPostDetail(post.id))
})

simulationsRouter.post('/draw', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const pool = db
    .prepare('SELECT representation_node_id AS id, is_priority AS isPriority FROM simulation_available_representations WHERE post_id = ?')
    .all(post.id)
  const participants = db
    .prepare('SELECT id, user_id AS userId, representation_node_id AS representationId FROM simulation_participants WHERE post_id = ?')
    .all(post.id)

  const alreadyAssigned = new Set(participants.filter((p) => p.representationId).map((p) => p.representationId))
  const unassigned = participants.filter((p) => !p.representationId)
  const availablePool = pool.filter((p) => !alreadyAssigned.has(p.id))
  const ordered = [...shuffle(availablePool.filter((p) => p.isPriority)), ...shuffle(availablePool.filter((p) => !p.isPriority))]
  const shuffledParticipants = shuffle(unassigned)

  const tx = db.transaction(() => {
    const count = Math.min(shuffledParticipants.length, ordered.length)
    for (let i = 0; i < count; i++) {
      db.prepare('UPDATE simulation_participants SET representation_node_id = ? WHERE id = ?').run(
        ordered[i].id,
        shuffledParticipants[i].id
      )
      maybeUpdateUserEmoji(shuffledParticipants[i].userId, ordered[i].id)
    }
    db.prepare('INSERT INTO post_history (post_id, action) VALUES (?, ?)').run(post.id, 'draw_redone')
  })
  tx()

  res.json(getPostDetail(post.id))
})

simulationsRouter.post('/draw/:userId', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const participant = db
    .prepare('SELECT * FROM simulation_participants WHERE post_id = ? AND user_id = ?')
    .get(post.id, req.params.userId)
  if (!participant) return res.status(404).json({ error: 'Participante não encontrado.' })

  const pool = db.prepare('SELECT representation_node_id AS id FROM simulation_available_representations WHERE post_id = ?').all(post.id)
  const takenByOthers = new Set(
    db
      .prepare(
        'SELECT representation_node_id FROM simulation_participants WHERE post_id = ? AND user_id != ? AND representation_node_id IS NOT NULL'
      )
      .all(post.id, req.params.userId)
      .map((r) => r.representation_node_id)
  )
  const candidates = pool.filter((p) => !takenByOthers.has(p.id))
  if (candidates.length === 0) return res.status(400).json({ error: 'Não há representações disponíveis para resortear.' })

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]
  db.prepare('UPDATE simulation_participants SET representation_node_id = ? WHERE id = ?').run(chosen.id, participant.id)
  maybeUpdateUserEmoji(participant.user_id, chosen.id)
  db.prepare('INSERT INTO post_history (post_id, action) VALUES (?, ?)').run(post.id, 'draw_redone')

  res.json(getPostDetail(post.id))
})

simulationsRouter.patch('/participants/:userId', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const participant = db
    .prepare('SELECT * FROM simulation_participants WHERE post_id = ? AND user_id = ?')
    .get(post.id, req.params.userId)
  if (!participant) return res.status(404).json({ error: 'Participante não encontrado.' })

  const { representationNodeId } = req.body ?? {}
  const inPool = db
    .prepare('SELECT 1 FROM simulation_available_representations WHERE post_id = ? AND representation_node_id = ?')
    .get(post.id, representationNodeId)
  if (!inPool) return res.status(400).json({ error: 'Representação inválida para essa simulação.' })

  const taken = db
    .prepare('SELECT 1 FROM simulation_participants WHERE post_id = ? AND representation_node_id = ? AND user_id != ?')
    .get(post.id, representationNodeId, req.params.userId)
  if (taken) return res.status(400).json({ error: 'Essa representação já está atribuída a outra pessoa.' })

  db.prepare('UPDATE simulation_participants SET representation_node_id = ? WHERE id = ?').run(representationNodeId, participant.id)
  maybeUpdateUserEmoji(participant.user_id, representationNodeId)

  res.json(getPostDetail(post.id))
})

simulationsRouter.delete('/participants/:userId', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return
  db.prepare('DELETE FROM simulation_participants WHERE post_id = ? AND user_id = ?').run(post.id, req.params.userId)
  db.prepare('DELETE FROM speaking_order WHERE post_id = ? AND user_id = ?').run(post.id, req.params.userId)
  res.json(getPostDetail(post.id))
})

simulationsRouter.patch('/speaking-order', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const { userIds } = req.body ?? {}
  if (!Array.isArray(userIds)) return res.status(400).json({ error: 'Ordem inválida.' })

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM speaking_order WHERE post_id = ?').run(post.id)
    const insert = db.prepare('INSERT INTO speaking_order (post_id, user_id, position) VALUES (?, ?, ?)')
    userIds.forEach((userId, index) => insert.run(post.id, userId, index))
  })
  tx()

  res.json(getSimulationDetail(post.id))
})

simulationsRouter.patch('/speaking-order-visibility', requireAdmin, (req, res) => {
  const post = loadSimulationPost(req, res)
  if (!post) return

  const details = db.prepare('SELECT is_open FROM simulation_details WHERE post_id = ?').get(post.id)
  const { visible } = req.body ?? {}
  if (visible && details.is_open) {
    return res.status(400).json({ error: 'Encerre a simulação antes de tornar a ordem de oradores visível.' })
  }

  db.prepare('UPDATE simulation_details SET speaking_order_visible = ? WHERE post_id = ?').run(visible ? 1 : 0, post.id)
  res.json(getPostDetail(post.id))
})
