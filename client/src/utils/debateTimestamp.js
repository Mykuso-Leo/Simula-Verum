function parseSqliteUtc(sqliteDatetime) {
  return new Date(`${sqliteDatetime.replace(' ', 'T')}Z`)
}

export function formatDebateTimestamp(sqliteDatetime) {
  const sent = parseSqliteUtc(sqliteDatetime)
  const now = new Date()
  const sameDay =
    sent.getFullYear() === now.getFullYear() && sent.getMonth() === now.getMonth() && sent.getDate() === now.getDate()

  if (sameDay) {
    const diffHours = Math.max(0, Math.floor((now - sent) / (1000 * 60 * 60)))
    return `há ${diffHours} h`
  }

  const day = String(sent.getDate()).padStart(2, '0')
  const month = String(sent.getMonth() + 1).padStart(2, '0')
  const hours = String(sent.getHours()).padStart(2, '0')
  const minutes = String(sent.getMinutes()).padStart(2, '0')
  const datePart = sent.getFullYear() === now.getFullYear() ? `${day}/${month}` : `${day}/${month}/${sent.getFullYear()}`
  return `${datePart} às ${hours}:${minutes}`
}
