export function parseDateTime(value: string) {
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

export function formatDateOnly(value: string) {
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (!dateOnly) return value

  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return value

  return `${day}.${month}.${year}`
}
