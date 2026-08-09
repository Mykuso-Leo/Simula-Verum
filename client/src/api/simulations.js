import { apiFetch } from './api.js'

export const getRepresentationsTree = () => apiFetch('/tree/representations')
export const getCommitteesTree = () => apiFetch('/tree/committees')

export const setOpen = (postId, isOpen) => apiFetch(`/posts/${postId}/open`, { method: 'PATCH', body: JSON.stringify({ isOpen }) })

export const setRepresentationPool = (postId, nodeIds, priorityNodeIds) =>
  apiFetch(`/posts/${postId}/representations`, {
    method: 'PATCH',
    body: JSON.stringify({ nodeIds, priorityNodeIds })
  })

export const joinSimulation = (postId, representationNodeId) =>
  apiFetch(`/posts/${postId}/join`, {
    method: 'POST',
    body: JSON.stringify(representationNodeId ? { representationNodeId } : {})
  })

export const runDraw = (postId) => apiFetch(`/posts/${postId}/draw`, { method: 'POST' })
export const redrawOne = (postId, userId) => apiFetch(`/posts/${postId}/draw/${userId}`, { method: 'POST' })
export const reassignParticipant = (postId, userId, representationNodeId) =>
  apiFetch(`/posts/${postId}/participants/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ representationNodeId })
  })
export const removeParticipant = (postId, userId) =>
  apiFetch(`/posts/${postId}/participants/${userId}`, { method: 'DELETE' })

export const setSpeakingOrder = (postId, userIds) =>
  apiFetch(`/posts/${postId}/speaking-order`, { method: 'PATCH', body: JSON.stringify({ userIds }) })
export const setSpeakingOrderVisibility = (postId, visible) =>
  apiFetch(`/posts/${postId}/speaking-order-visibility`, { method: 'PATCH', body: JSON.stringify({ visible }) })
