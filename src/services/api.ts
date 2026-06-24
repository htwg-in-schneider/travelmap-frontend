import { type Trip, type Comment, type UserSummary } from '@/data'
import { auth0 } from '@/auth0'

export interface CreateTripPayload {
  title: string
  date: string
  text: string
  countryCode: string | null
  latitude: number | null
  longitude: number | null
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL
if (typeof rawApiBaseUrl !== 'string' || rawApiBaseUrl.trim() === '') {
  throw new Error('VITE_API_BASE_URL environment variable is required but not set')
}
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '')

const BASE_URL = `${API_BASE_URL}/api/trip`
const COMMENT_URL = `${API_BASE_URL}/api/comment`
const FEED_URL = `${API_BASE_URL}/api/feed`
const USER_URL = `${API_BASE_URL}/api/user`
const ME_URL = `${API_BASE_URL}/api/me`
const ADMIN_USERS_URL = `${API_BASE_URL}/api/admin/users`

export interface PresignedUpload {
  uploadUrl: string
  publicUrl: string
  key: string
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!auth0.isAuthenticated.value) return {}
  try {
    const token = await auth0.getAccessTokenSilently()
    return { Authorization: `Bearer ${token}` }
  } catch (err) {
    console.error('Failed to get access token:', err)
    return {}
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: await authHeaders() })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function sendJson<T>(method: string, url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    let errorBody: unknown = null
    try {
      errorBody = await response.json()
    } catch {
      errorBody = await response.text().catch(() => null)
    }
    const message =
      typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody
        ? String((errorBody as { error: string }).error)
        : `HTTP error! status: ${response.status}`
    throw new ApiError(response.status, errorBody, message)
  }
  if (response.status === 204) return undefined as unknown as T
  return response.json()
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function fetchTrips(params?: { q?: string }): Promise<Trip[]> {
  const url = new URL(BASE_URL)
  if (params?.q) url.searchParams.set('q', params.q)
  return getJson<Trip[]>(url.toString())
}

export async function fetchTripById(id: string | string[]): Promise<Trip | null> {
  const response = await fetch(`${BASE_URL}/${id}`, { headers: await authHeaders() })
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  return sendJson('POST', BASE_URL, payload)
}

export async function updateTrip(id: number, payload: CreateTripPayload): Promise<Trip> {
  return sendJson('PUT', `${BASE_URL}/${id}`, payload)
}

export async function deleteTrip(id: number): Promise<void> {
  return sendJson('DELETE', `${BASE_URL}/${id}`)
}

export async function requestImageUploadUrls(
  tripId: number,
  files: File[],
): Promise<PresignedUpload[]> {
  const payload = files.map((file) => ({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  }))
  return sendJson('POST', `${BASE_URL}/${tripId}/images/upload-urls`, payload)
}

export async function uploadImageToR2(presignedUpload: PresignedUpload, file: File): Promise<void> {
  const response = await fetch(presignedUpload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) throw new Error(`Upload to R2 failed! status: ${response.status}`)
}

export async function saveTripImages(
  tripId: number,
  images: { url: string; filename: string }[],
): Promise<Trip> {
  return sendJson('POST', `${BASE_URL}/${tripId}/images`, images)
}

// ---------------------------------------------------------------------------
// Feed (Instagram-style)
// ---------------------------------------------------------------------------

/** Feed of trips posted by the users I follow (falls back to all trips). */
export async function fetchFeed(): Promise<Trip[]> {
  return getJson<Trip[]>(FEED_URL)
}

/** Explore stream: all recent trips regardless of follow state. */
export async function fetchExplore(): Promise<Trip[]> {
  return getJson<Trip[]>(`${FEED_URL}?explore=true`)
}

export interface LikeState {
  likeCount: number
  likedByMe: boolean
}

export async function likeTrip(tripId: number): Promise<LikeState> {
  return sendJson('POST', `${BASE_URL}/${tripId}/like`)
}

export async function unlikeTrip(tripId: number): Promise<LikeState> {
  return sendJson('DELETE', `${BASE_URL}/${tripId}/like`)
}

// ---------------------------------------------------------------------------
// Users / profiles / follow
// ---------------------------------------------------------------------------

export async function fetchUserProfile(username: string): Promise<UserSummary> {
  return getJson<UserSummary>(`${USER_URL}/${encodeURIComponent(username)}`)
}

export async function fetchUserTrips(username: string): Promise<Trip[]> {
  return getJson<Trip[]>(`${USER_URL}/${encodeURIComponent(username)}/trips`)
}

export async function searchUsers(q: string): Promise<UserSummary[]> {
  const url = new URL(`${USER_URL}/search`)
  url.searchParams.set('q', q)
  return getJson<UserSummary[]>(url.toString())
}

export async function followUser(username: string): Promise<UserSummary> {
  return sendJson('POST', `${USER_URL}/${encodeURIComponent(username)}/follow`)
}

export async function unfollowUser(username: string): Promise<UserSummary> {
  return sendJson('DELETE', `${USER_URL}/${encodeURIComponent(username)}/follow`)
}

// ---------------------------------------------------------------------------
// Me
// ---------------------------------------------------------------------------

export interface MeResponse {
  id: number
  username: string
  displayName: string
  email: string
  bio: string
  avatarUrl: string
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  admin: boolean
  tripCount: number
  followingCount: number
  followerCount: number
}

export interface UpdateProfilePayload {
  displayName: string | null
  bio: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
}

export async function fetchMe(): Promise<MeResponse> {
  return getJson<MeResponse>(ME_URL)
}

export async function updateMe(payload: UpdateProfilePayload): Promise<MeResponse> {
  return sendJson('PUT', ME_URL, payload)
}

export interface AdminUser {
  id: number
  username: string
  displayName: string
  email: string
  bio: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  admin: boolean
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return getJson<AdminUser[]>(ADMIN_USERS_URL)
}

export async function updateAdminUser(
  id: number,
  payload: Partial<
    Pick<
      AdminUser,
      'username' | 'displayName' | 'email' | 'bio' | 'street' | 'postalCode' | 'city' | 'country'
    >
  >,
): Promise<AdminUser> {
  return sendJson('PUT', `${ADMIN_USERS_URL}/${id}`, payload)
}

export async function deleteAdminUser(id: number): Promise<void> {
  return sendJson('DELETE', `${ADMIN_USERS_URL}/${id}`)
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export async function fetchCommentsByTrip(id: string | string[]): Promise<Comment[]> {
  const raw = Array.isArray(id) ? id[0] : id
  return getJson<Comment[]>(`${COMMENT_URL}/trip/${raw}`)
}

export interface CreateCommentPayload {
  text: string
  trip: { id: number }
}

export async function createComment(payload: CreateCommentPayload): Promise<Comment> {
  return sendJson('POST', COMMENT_URL, payload)
}

export async function deleteComment(id: number): Promise<void> {
  return sendJson('DELETE', `${COMMENT_URL}/${id}`)
}
