function parseSqliteUtc(sqliteDatetime) {
  return new Date(`${sqliteDatetime.replace(' ', 'T')}Z`)
}

export function formatPostTimestamp(sqliteDatetime) {
  const created = parseSqliteUtc(sqliteDatetime)
  const now = new Date()
  const diffHours = (now - created) / (1000 * 60 * 60)

  if (diffHours <= 24) {
    return `há ${Math.max(0, Math.floor(diffHours))} h`
  }

  const day = String(created.getDate()).padStart(2, '0')
  const month = String(created.getMonth() + 1).padStart(2, '0')

  if (created.getFullYear() === now.getFullYear()) {
    return `Criado em ${day}/${month}`
  }
  return `Criado em ${day}/${month}/${created.getFullYear()}`
}

const HISTORY_VERBS = {
  created: 'Criado',
  edited: 'Editado',
  draw_redone: 'Sorteio refeito'
}

export function formatHistoryEntry(entry) {
  const date = parseSqliteUtc(entry.created_at)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const verb = HISTORY_VERBS[entry.action] || entry.action
  return `${verb} no dia ${day}/${month}/${date.getFullYear()} às ${hours}:${minutes}`
}
