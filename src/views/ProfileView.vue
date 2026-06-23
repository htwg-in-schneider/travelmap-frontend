<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import {
  fetchMe,
  updateMe,
  fetchUserProfile,
  fetchUserTrips,
  followUser,
  unfollowUser,
  type MeResponse,
} from '@/services/api'
import type { Trip, UserSummary } from '@/data'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TravelCard from '@/components/TravelCard.vue'
import { auth0 } from '@/auth0'

const route = useRoute()
const router = useRouter()

const me = ref<MeResponse | null>(null)
const profile = ref<UserSummary | null>(null)
const trips = ref<Trip[]>([])

const loading = ref(true)
const loadError = ref('')

const editMode = ref(true) // owner sees the editable profile form
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)
const followBusy = ref(false)
const followError = ref('')

const displayName = ref('')
const bio = ref('')
const street = ref('')
const postalCode = ref('')
const city = ref('')
const country = ref('')

const usernameParam = computed(() => (route.params.username as string | undefined) ?? null)
const avatarUrl = computed(() => profile.value?.avatarUrl ?? me.value?.avatarUrl ?? null)

onMounted(async () => {
  await loadAll()
})

watch(usernameParam, async () => {
  await loadAll()
})

async function loadAll() {
  loading.value = true
  loadError.value = ''
  try {
    if (me.value === null && auth0.isAuthenticated.value) {
      me.value = await fetchMe()
    }
    if (usernameParam.value) {
      await loadPublicProfile(usernameParam.value)
    } else if (auth0.isAuthenticated.value) {
      // own profile (/profile route): editable form
      fillEditForm(me.value)
    } else {
      router.replace({ name: 'home' })
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    loadError.value = 'Fehler beim Laden des Profils.'
  } finally {
    loading.value = false
  }
}

async function loadPublicProfile(username: string) {
  profile.value = await fetchUserProfile(username)
  editMode.value = profile.value.isMe
  if (editMode.value && me.value) fillEditForm(me.value)
  try {
    trips.value = await fetchUserTrips(username)
  } catch (err) {
    console.error('Error loading user trips:', err)
    trips.value = []
  }
}

function fillEditForm(me: MeResponse | null) {
  if (!me) return
  displayName.value = me.displayName ?? ''
  bio.value = me.bio ?? ''
  street.value = me.street ?? ''
  postalCode.value = me.postalCode ?? ''
  city.value = me.city ?? ''
  country.value = me.country ?? ''
}

async function submit() {
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    const updated = await updateMe({
      displayName: displayName.value.trim() || null,
      bio: bio.value.trim() || null,
      street: street.value.trim() || null,
      postalCode: postalCode.value.trim() || null,
      city: city.value.trim() || null,
      country: country.value.trim() || null,
    })
    me.value = updated
    saved.value = true
  } catch (err) {
    console.error('Error saving profile:', err)
    saveError.value = 'Fehler beim Speichern. Bitte versuche es erneut.'
  } finally {
    saving.value = false
  }
}

async function toggleFollow() {
  if (!profile.value || profile.value.isMe) return
  followBusy.value = true
  followError.value = ''
  try {
    const next = profile.value.following ? await unfollowUser(profile.value.username) : await followUser(profile.value.username)
    profile.value = next
  } catch (err) {
    console.error('Error toggling follow:', err)
    followError.value = 'Aktion fehlgeschlagen.'
  } finally {
    followBusy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="relative z-10 mb-8 flex items-center gap-4">
          <button
            class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
            @click="router.back()"
          >
            <ArrowLeftIcon class="h-5 w-5" />
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ profile ? `@${profile.username}` : 'Mein Profil' }}
          </h1>
        </div>

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="loadError" class="text-red-500">{{ loadError }}</div>
        <template v-else-if="profile && !editMode">
          <!-- Public profile view -->
          <header class="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profile.username"
              class="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow"
            />
            <div
              v-else
              class="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-semibold text-blue-700"
            >
              {{ profile.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 text-center sm:text-left">
              <div class="text-lg font-semibold text-gray-900">
                {{ profile.displayName || profile.username }}
              </div>
              <div class="text-sm text-gray-500">@{{ profile.username }}</div>
              <p v-if="profile.bio" class="mt-2 text-gray-700">{{ profile.bio }}</p>
              <div class="mt-3 flex justify-center gap-6 text-sm text-gray-600 sm:justify-start">
                <span><strong class="text-gray-900">{{ profile.tripCount }}</strong> Reisen</span>
                <span><strong class="text-gray-900">{{ profile.followerCount }}</strong> Follower</span>
                <span><strong class="text-gray-900">{{ profile.followingCount }}</strong> folgt</span>
              </div>
            </div>
            <button
              v-if="!profile.isMe"
              :disabled="followBusy"
              class="rounded-xl px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed"
              :class="[
                followBusy ? 'bg-blue-400' : profile.following ? 'bg-gray-300 hover:bg-gray-400' : 'bg-blue-600 hover:bg-blue-700',
              ]"
              @click="toggleFollow"
            >
              {{ profile.following ? 'Entfolgen' : 'Folgen' }}
            </button>
          </header>
          <p v-if="followError" class="mt-3 text-sm text-red-500">{{ followError }}</p>

          <div v-if="trips.length === 0" class="mt-10 text-gray-500">
            Noch keine Reisen veröffentlicht.
          </div>
          <div v-else class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TravelCard
              v-for="trip in trips"
              :key="trip.id"
              :id="trip.id"
              :title="trip.title"
              :image-url="trip.imageUrls[0]"
            />
          </div>
        </template>

        <form v-else class="flex flex-col gap-5" @submit.prevent="submit">
          <div class="flex items-center gap-4">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="me?.username ?? 'Ich'"
              class="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow"
            />
            <div
              v-else
              class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-700"
            >
              {{ (me?.username ?? '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-sm text-gray-500">Angemeldet als</div>
              <div class="font-semibold text-gray-900">@{{ me?.username }}</div>
              <div v-if="me?.admin" class="text-xs font-medium text-blue-700">Admin</div>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-name">Name</label>
            <input
              id="profile-name"
              v-model="displayName"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              v-model="bio"
              rows="3"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-street">Straße</label>
            <input
              id="profile-street"
              v-model="street"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div class="flex gap-4">
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="profile-postal-code">PLZ</label>
              <input
                id="profile-postal-code"
                v-model="postalCode"
                type="text"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>
            <div class="flex flex-[2] flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="profile-city">Ort</label>
              <input
                id="profile-city"
                v-model="city"
                type="text"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-country">Land</label>
            <input
              id="profile-country"
              v-model="country"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div v-if="saveError" class="text-sm text-red-500">{{ saveError }}</div>
          <div v-if="saved" class="text-sm text-green-600">Profil gespeichert.</div>

          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded-xl px-6 py-3 text-base font-medium text-white transition-colors disabled:cursor-not-allowed"
            :class="saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'"
          >
            {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  </div>
</template>