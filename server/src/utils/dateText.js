export function validateDateText(dateText) {
  const match = /^(\d{2})\/(\d{2})$/.exec(dateText)
  if (!match) return { valid: false, error: 'Data inválida. Use o formato DD/MM.' }

  const day = Number(match[1])
  const month = Number(match[2])
  const now = new Date()
  const year = now.getFullYear()

  const date = new Date(year, month - 1, day)
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  if (!isRealDate) return { valid: false, error: 'Essa data não existe.' }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (date < today) return { valid: false, error: 'Essa data já passou.' }

  return { valid: true }
}
