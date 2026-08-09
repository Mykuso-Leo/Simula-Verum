import { apiFetch } from './api.js'

export const getStorage = () => apiFetch('/admin/storage')
export const restoreDatabase = (answer) =>
  apiFetch('/admin/restore-database', { method: 'POST', body: JSON.stringify({ answer }) })

export const createRepresentationNode = (data) => apiFetch('/tree/representations', { method: 'POST', body: JSON.stringify(data) })
export const updateRepresentationNode = (id, data) =>
  apiFetch(`/tree/representations/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteRepresentationNode = (id) => apiFetch(`/tree/representations/${id}`, { method: 'DELETE' })

export const createCommitteeNode = (data) => apiFetch('/tree/committees', { method: 'POST', body: JSON.stringify(data) })
export const updateCommitteeNode = (id, data) =>
  apiFetch(`/tree/committees/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteCommitteeNode = (id) => apiFetch(`/tree/committees/${id}`, { method: 'DELETE' })
