import { defineStore } from 'pinia'
import { ref } from 'vue'
import { likeTrip, unlikeTrip, followUser, unfollowUser } from '@/services/api'
import type { Trip, UserSummary } from '@/data'

/**
 * Centralises optimistic social actions (like / follow) so any component can
 * trigger them and the reflected state stays consistent across views. The
 * backend is the source of truth; if a request fails we roll the local state
 * back.
 */
export const useSocialStore = defineStore('social', () => {
  // Maps tripId -> like state, used to share optimistic like updates across
  // the feed, explore and detail views.
  const likeCache = ref<Map<number, { likeCount: number; likedByMe: boolean }>>(new Map())

  function readLike(trip: Trip) {
    const cached = likeCache.value.get(trip.id)
    if (cached) return cached
    return { likeCount: trip.likeCount ?? 0, likedByMe: !!trip.likedByMe }
  }

  async function toggleLike(trip: Trip): Promise<{ likeCount: number; likedByMe: boolean }> {
    const current = readLike(trip)
    const wasLiked = current.likedByMe
    // Optimistic update
    const optimistic = {
      likeCount: Math.max(0, current.likeCount + (wasLiked ? -1 : 1)),
      likedByMe: !wasLiked,
    }
    likeCache.value.set(trip.id, optimistic)
    try {
      const result = wasLiked ? await unlikeTrip(trip.id) : await likeTrip(trip.id)
      likeCache.value.set(trip.id, { likeCount: result.likeCount, likedByMe: result.likedByMe })
      return result
    } catch (err) {
      // Rollback on failure
      likeCache.value.set(trip.id, current)
      throw err
    }
  }

  async function toggleFollow(target: UserSummary): Promise<UserSummary> {
    const next = target.following ? await unfollowUser(target.username) : await followUser(target.username)
    return next
  }

  return { likeCache, readLike, toggleLike, toggleFollow }
})