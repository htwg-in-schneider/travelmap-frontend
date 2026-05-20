import { type Trip } from '@/data'

export interface CreateTripPayload {
  title: string
  date: string
  text: string
  countryCode: string | null
  latitude: number | null
  longitude: number | null
}

const BASE_URL = 'http://localhost:8081/api/trip'

export async function fetchTrips(params?: { title?: string; text?: string }): Promise<Trip[]> {
  const url = new URL(BASE_URL)
  if (params?.title) url.searchParams.set('title', params.title)
  if (params?.text) url.searchParams.set('text', params.text)
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchTripById(id: string | string[]): Promise<Trip | null> {
  const response = await fetch(`${BASE_URL}/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}
