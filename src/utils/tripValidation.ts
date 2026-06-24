import type { CreateTripPayload } from '@/services/api'

export const TRIP_TITLE_MAX_LENGTH = 120
export const TRIP_TEXT_MAX_LENGTH = 10_000

export function validateTripPayload(payload: CreateTripPayload): string | null {
  const title = payload.title.trim()
  if (!title) {
    return 'Titel ist ein Pflichtfeld.'
  }
  if (title.length > TRIP_TITLE_MAX_LENGTH) {
    return `Titel darf maximal ${TRIP_TITLE_MAX_LENGTH} Zeichen lang sein.`
  }

  const text = payload.text.trim()
  if (!text) {
    return 'Beschreibung ist ein Pflichtfeld.'
  }
  if (text.length > TRIP_TEXT_MAX_LENGTH) {
    return `Beschreibung darf maximal ${TRIP_TEXT_MAX_LENGTH} Zeichen lang sein.`
  }

  if (payload.date && Number.isNaN(Date.parse(payload.date))) {
    return 'Datum ist ungültig.'
  }

  if (payload.countryCode && !/^[a-z]{2}$/i.test(payload.countryCode)) {
    return 'Ländercode ist ungültig.'
  }

  if (payload.latitude !== null && (payload.latitude < -90 || payload.latitude > 90)) {
    return 'Breitengrad ist ungültig.'
  }

  if (payload.longitude !== null && (payload.longitude < -180 || payload.longitude > 180)) {
    return 'Längengrad ist ungültig.'
  }

  return null
}
