import type { CreateTripPayload } from '@/services/api'

export const TRIP_TITLE_MAX_LENGTH = 120
export const TRIP_TEXT_MAX_LENGTH = 10_000

export type TripFieldName = 'title' | 'text' | 'date' | 'countryCode' | 'latitude' | 'longitude'
export type TripFieldErrors = Partial<Record<TripFieldName, string>>

export function validateTripPayloadFields(payload: CreateTripPayload): TripFieldErrors {
  const errors: TripFieldErrors = {}
  const title = payload.title.trim()
  const text = payload.text.trim()

  if (!title) {
    errors.title = 'Titel ist ein Pflichtfeld.'
  } else if (title.length > TRIP_TITLE_MAX_LENGTH) {
    errors.title = `Titel darf maximal ${TRIP_TITLE_MAX_LENGTH} Zeichen lang sein.`
  }

  if (!text) {
    errors.text = 'Beschreibung ist ein Pflichtfeld.'
  } else if (text.length > TRIP_TEXT_MAX_LENGTH) {
    errors.text = `Beschreibung darf maximal ${TRIP_TEXT_MAX_LENGTH} Zeichen lang sein.`
  }

  if (payload.date && Number.isNaN(Date.parse(payload.date))) {
    errors.date = 'Datum ist ungültig.'
  }

  if (payload.countryCode && !/^[a-z]{2}$/i.test(payload.countryCode)) {
    errors.countryCode = 'Ländercode ist ungültig.'
  }

  if (payload.latitude !== null && (payload.latitude < -90 || payload.latitude > 90)) {
    errors.latitude = 'Breitengrad ist ungültig.'
  }

  if (payload.longitude !== null && (payload.longitude < -180 || payload.longitude > 180)) {
    errors.longitude = 'Längengrad ist ungültig.'
  }

  return errors
}

export function validateTripPayload(payload: CreateTripPayload): string | null {
  return Object.values(validateTripPayloadFields(payload)).find(Boolean) ?? null
}
