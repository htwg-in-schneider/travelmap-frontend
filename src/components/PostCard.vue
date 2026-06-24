<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type Trip } from '@/data'
import { useSocialStore } from '@/stores/social'
import { auth0, AUTH_UNAVAILABLE_MESSAGE, loginWithRedirectSafe } from '@/auth0'
import {
  HeartIcon as HeartSolid,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/solid'
import { HeartIcon as HeartOutline } from '@heroicons/vue/24/outline'
import placeholder from '../../assets/placeholder.png'

const props = defineProps<{ trip: Trip }>()
const router = useRouter()
const social = useSocialStore()
const { isAuthenticated } = auth0

const images = computed(() => props.trip.imageUrls ?? [])
const currentIndex = ref(0)
const currentImage = computed(() => images.value[currentIndex.value] ?? placeholder)

const likeState = computed(() => social.readLike(props.trip))
const likeBusy = ref(false)
const authError = ref('')

function go() {
  router.push({ name: 'trip-detail', params: { id: props.trip.id } })
}

function goProfile() {
  if (props.trip.authorUsername) router.push({ name: 'profile-username', params: { username: props.trip.authorUsername } })
}

async function login() {
  try {
    authError.value = ''
    await loginWithRedirectSafe()
  } catch (err) {
    console.error('[PostCard] loginWithRedirect failed:', err)
    authError.value = err instanceof Error ? err.message : AUTH_UNAVAILABLE_MESSAGE
  }
}

async function toggleLike() {
  if (!isAuthenticated.value) {
    await login()
    return
  }
  authError.value = ''
  if (likeBusy.value) return
  likeBusy.value = true
  try {
    await social.toggleLike(props.trip)
  } catch (err) {
    console.error('Failed to toggle like:', err)
  } finally {
    likeBusy.value = false
  }
}

function openComments() {
  if (!isAuthenticated.value) {
    login()
    return
  }
  authError.value = ''
  go()
}

function prev() {
  currentIndex.value = currentIndex.value === 0 ? images.value.length - 1 : currentIndex.value - 1
}
function next() {
  currentIndex.value = currentIndex.value === images.value.length - 1 ? 0 : currentIndex.value + 1
}
</script>

<template>
  <article class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div class="flex items-center gap-3 px-4 py-3">
      <router-link
        v-if="trip.authorUsername"
        :to="{ name: 'profile-username', params: { username: trip.authorUsername } }"
        class="flex items-center gap-3"
        @click.stop
      >
        <img
          v-if="trip.authorAvatarUrl"
          :src="trip.authorAvatarUrl"
          :alt="trip.authorUsername"
          class="h-9 w-9 rounded-full object-cover"
        />
        <div
          v-else
          class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
        >
          {{ (trip.authorUsername || trip.ownerName || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="leading-tight">
          <div class="text-sm font-semibold text-gray-900">{{ trip.authorUsername ?? 'Anonym' }}</div>
          <div v-if="trip.ownerName && trip.ownerName !== trip.authorUsername" class="text-xs text-gray-500">
            {{ trip.ownerName }}
          </div>
        </div>
      </router-link>
      <div v-else class="text-sm font-semibold text-gray-900">Anonym</div>
      <span
        v-if="trip.publicTrip === false"
        class="ml-auto flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
      >
        <LockClosedIcon class="h-3.5 w-3.5" />
        Privat
      </span>
    </div>

    <div class="relative aspect-square w-full bg-gray-100" @click.stop>
      <img :src="currentImage" :alt="trip.title" class="h-full w-full cursor-pointer object-cover" @click="go" />
      <button
        v-if="images.length > 1"
        @click="prev"
        class="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
        aria-label="Vorheriges Bild"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>
      <button
        v-if="images.length > 1"
        @click="next"
        class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
        aria-label="Nächstes Bild"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
      <div v-if="images.length > 1" class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        <span
          v-for="(_, index) in images"
          :key="index"
          class="h-1.5 w-1.5 rounded-full"
          :class="index === currentIndex ? 'bg-white' : 'bg-white/50'"
        />
      </div>
    </div>

    <div class="flex items-center gap-4 px-4 py-3">
      <button
        :disabled="likeBusy"
        class="flex items-center gap-1.5 transition-colors disabled:opacity-50"
        :class="[
          isAuthenticated
            ? likeState.likedByMe
              ? 'text-red-600'
              : 'text-gray-700 hover:text-red-600'
            : 'text-gray-400 hover:text-gray-500',
        ]"
        :title="isAuthenticated ? undefined : 'Anmelden, um zu liken'"
        @click="toggleLike"
        :aria-pressed="likeState.likedByMe"
        aria-label="Like"
      >
        <HeartSolid v-if="likeState.likedByMe" class="h-6 w-6" />
        <HeartOutline v-else class="h-6 w-6" />
        <span class="text-sm font-medium">{{ likeState.likeCount }}</span>
      </button>
      <button
        class="flex items-center gap-1.5"
        :class="isAuthenticated ? 'text-gray-700 hover:text-blue-600' : 'text-gray-400 hover:text-gray-500'"
        :title="isAuthenticated ? undefined : 'Anmelden, um zu kommentieren'"
        @click="openComments"
        aria-label="Kommentare"
      >
        <ChatBubbleLeftIcon class="h-6 w-6" />
        <span class="text-sm font-medium">{{ trip.commentCount }}</span>
      </button>
      <span v-if="trip.countryCode" class="ml-auto text-base" :class="'fi-' + trip.countryCode.toLowerCase()" />
    </div>

    <div
      v-if="authError"
      class="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ authError }}
    </div>

    <div class="px-4 pb-4">
      <p class="text-sm text-gray-900">
        <button v-if="trip.authorUsername" class="font-semibold hover:underline" @click="goProfile">
          {{ trip.authorUsername }}
        </button>
        <span v-if="trip.text" class="ml-1 text-gray-700">{{ trip.text }}</span>
      </p>
    </div>
  </article>
</template>
