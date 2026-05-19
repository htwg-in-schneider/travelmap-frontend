import { type Trip } from '@/data'

const BASE_URL = 'http://localhost:8081/api/trip'

export async function fetchTrips(): Promise<Trip[]> {
  const response = await fetch(BASE_URL)
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
