import { apiFetch } from './api.js'

export const listAttachments = (postId) => apiFetch(`/posts/${postId}/attachments`)

export async function uploadAttachment(postId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api/posts/${postId}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.error || 'Erro ao enviar arquivo.')
    error.status = res.status
    throw error
  }
  return data
}

export const deleteAttachment = (postId, attachmentId) =>
  apiFetch(`/posts/${postId}/attachments/${attachmentId}`, { method: 'DELETE' })

export const attachmentUrl = (postId, attachmentId) => `/api/posts/${postId}/attachments/${attachmentId}`
