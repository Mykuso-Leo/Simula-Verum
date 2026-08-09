const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.error || 'Erro inesperado.')
    error.status = res.status
    throw error
  }
  return data
}
