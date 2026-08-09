import { apiFetch } from './api.js'

export const listDebateMessages = (sinceId) => apiFetch(`/debates/messages${sinceId ? `?since=${sinceId}` : ''}`)
export const sendDebateMessage = (body) =>
  apiFetch('/debates/messages', { method: 'POST', body: JSON.stringify({ body }) })
export const getForumState = () => apiFetch('/debates/state')
export const lockForum = () => apiFetch('/debates/lock', { method: 'POST' })
export const unlockForum = () => apiFetch('/debates/unlock', { method: 'POST' })
export const purgeDebateMessages = (olderThan) =>
  apiFetch('/debates/purge', { method: 'POST', body: JSON.stringify({ olderThan }) })
export const listPenalties = () => apiFetch('/debates/penalties')
export const clearPenalty = (userId) => apiFetch(`/debates/penalties/${userId}/clear`, { method: 'POST' })
export const deleteDebateMessage = (id) => apiFetch(`/debates/messages/${id}`, { method: 'DELETE' })
