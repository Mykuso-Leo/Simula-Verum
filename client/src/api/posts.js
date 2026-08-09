import { apiFetch } from './api.js'

export const listPosts = () => apiFetch('/posts')
export const getPost = (id) => apiFetch(`/posts/${id}`)
export const createPost = (data) => apiFetch('/posts', { method: 'POST', body: JSON.stringify({ type: 'text', ...data }) })
export const updatePost = (id, data) => apiFetch(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deletePost = (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' })
export const pinPost = (id) => apiFetch(`/posts/${id}/pin`, { method: 'POST' })
export const unpinPost = (id) => apiFetch(`/posts/${id}/unpin`, { method: 'POST' })
