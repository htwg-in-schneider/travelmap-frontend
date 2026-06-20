import { type Trip, type Comment } from '@/data'

export interface CreateTripPayload {
  title: string
  date: string
  text: string
  countryCode: string | null
  latitude: number | null
  longitude: number | null
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'https://travelmap-backend-94cp.onrender.com'

const BASE_URL = `${API_BASE_URL}/api/trip`
const COMMENT_URL = `${API_BASE_URL}/api/comment`

type TripApiResponse = Omit<Trip, 'commentCount'> & {
  commentCount?: number | null
}

async function fetchCommentCountByTrip(id: number): Promise<number> {
  const response = await fetch(`${COMMENT_URL}/trip/${id}/count`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (typeof data === 'number') return data
  if (typeof data === 'string') return Number(data)

  if (
    typeof data === 'object' &&
    data !== null &&
    'count' in data &&
    typeof (data as { count: unknown }).count === 'number'
  ) {
    return (data as { count: number }).count
  }

  throw new Error(`Unexpected comment count payload for trip ${id}`)
}

async function normalizeTrip(trip: TripApiResponse): Promise<Trip> {
  let commentCount = 0

  if (typeof trip.commentCount === 'number') {
    commentCount = trip.commentCount
  } else {
    try {
      commentCount = await fetchCommentCountByTrip(trip.id)
    } catch (err) {
      console.error(`Failed to fetch comment count for trip ${trip.id}:`, err)
    }
  }

  return {
    ...trip,
    commentCount,
  }
}

export async function fetchTrips(params?: { q?: string }): Promise<Trip[]> {
  const url = new URL(BASE_URL)
  if (params?.q) url.searchParams.set('q', params.q)
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const trips: TripApiResponse[] = await response.json()
  return Promise.all(trips.map((trip) => normalizeTrip(trip)))
}

export async function fetchTripById(id: string | string[]): Promise<Trip | null> {
  const response = await fetch(`${BASE_URL}/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const trip: TripApiResponse = await response.json()
  return normalizeTrip(trip)
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
  const trip: TripApiResponse = await response.json()
  return normalizeTrip(trip)
}

export async function updateTrip(id: number, payload: CreateTripPayload): Promise<Trip> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const trip: TripApiResponse = await response.json()
  return normalizeTrip(trip)
}

export async function deleteTrip(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

export async function fetchCommentsByTrip(id: string | string[]): Promise<Comment[]> {
  const response = await fetch(`${COMMENT_URL}/trip/${id}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export interface CreateCommentPayload {
  text: string
  userName: string
  trip: { id: number }
}

export async function createComment(payload: CreateCommentPayload): Promise<Comment> {
  const response = await fetch(COMMENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}
