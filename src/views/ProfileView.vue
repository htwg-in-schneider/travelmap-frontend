<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/solid'
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
import Button from '@/components/Button.vue'
import TravelCard from '@/components/TravelCard.vue'
import TripFilter from '@/components/TripFilter.vue'
import TripSearch from '@/components/TripSearch.vue'
import Map from '@/components/Map.vue'
import { auth0 } from '@/auth0'
import { useUserRole } from '@/composables/useUserRole'
import { getContinentByCountryCode, type Continent } from '@/utils/continents'
import { parseDateTime } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const { isAdmin, isSupport, isMarketing } = useUserRole()
const isStaff = computed(() => isAdmin.value || isSupport.value || isMarketing.value)

const me = ref<MeResponse | null>(null)
const profile = ref<UserSummary | null>(null)
const trips = ref<Trip[]>([])

const loading = ref(true)
const loadError = ref('')

const editMode = ref(false)
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

type OrderBy = 'newest' | 'oldest' | 'most-commented'

const showFilter = ref(false)
const showSearch = ref(false)
const searchTerm = ref('')
const selectedContinent = ref<Continent | ''>('')
const orderBy = ref<OrderBy>('newest')
const searchDebounceMs = 250
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const usernameParam = computed(() => (route.params.username as string | undefined) ?? null)
const avatarUrl = computed(() => profile.value?.avatarUrl ?? me.value?.avatarUrl ?? null)

const visibleTrips = computed(() => {
  let nextTrips = [...trips.value]

  if (searchTerm.value.trim()) {
    const q = searchTerm.value.trim().toLowerCase()
    nextTrips = nextTrips.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.text ?? '').toLowerCase().includes(q) ||
        (t.authorUsername ?? '').toLowerCase().includes(q),
    )
  }

  if (selectedContinent.value) {
    nextTrips = nextTrips.filter(
      (trip) => getContinentByCountryCode(trip.countryCode) === selectedContinent.value,
    )
  }

  if (orderBy.value === 'most-commented') {
    nextTrips.sort((left, right) => right.commentCount - left.commentCount)
    return nextTrips
  }

  if (orderBy.value === 'newest' || orderBy.value === 'oldest') {
    nextTrips.sort((left, right) => {
      const leftTime = parseDateTime(left.date)
      const rightTime = parseDateTime(right.date)
      return orderBy.value === 'oldest' ? leftTime - rightTime : rightTime - leftTime
    })
  }

  return nextTrips
})

function waitForAuthReady(): Promise<void> {
  if (!auth0.isLoading.value) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(auth0.isLoading, (loading) => {
      if (!loading) {
        stop()
        resolve()
      }
    })
  })
}

onMounted(async () => {
  await waitForAuthReady()
  await loadAll()
})

watch(usernameParam, async () => {
  editMode.value = false
  await loadAll()
})

// Reload when auth state changes (e.g. after login redirect)
watch(
  () => auth0.isAuthenticated.value,
  async (isAuth) => {
    if (isAuth && !profile.value && !loading.value) {
      await loadAll()
    }
  },
)

async function loadAll() {
  loading.value = true
  loadError.value = ''
  try {
    // fetchMe is best-effort; if it fails we may still load public profiles
    if (me.value === null && auth0.isAuthenticated.value) {
      try {
        me.value = await fetchMe()
      } catch (err) {
        console.warn('[Profile] fetchMe failed, continuing without me:', err)
        me.value = null
      }
    }

    if (usernameParam.value) {
      await loadPublicProfile(usernameParam.value)
    } else if (auth0.isAuthenticated.value && me.value) {
      // own profile (/profile route): editable form
      profile.value = {
        id: me.value.id,
        username: me.value.username,
        displayName: me.value.displayName,
        bio: me.value.bio,
        avatarUrl: me.value.avatarUrl,
        tripCount: me.value.tripCount,
        followerCount: me.value.followerCount,
        followingCount: me.value.followingCount,
        following: false,
        isMe: true,
      }
      fillEditForm(me.value)
      await loadTrips(me.value.username)
    } else if (!auth0.isAuthenticated.value) {
      router.replace({ name: 'home' })
    } else {
      // authenticated but fetchMe failed; can’t show own profile
      loadError.value = 'Fehler beim Laden des eigenen Profils. Bitte erneut anmelden.'
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
  if (profile.value.isMe && me.value) fillEditForm(me.value)
  await loadTrips(username)
}

async function loadTrips(username: string) {
  try {
    trips.value = await fetchUserTrips(username)
  } catch (err) {
    console.error('Error loading user trips:', err)
    trips.value = []
  }
}

function fillEditForm(data: MeResponse | null) {
  if (!data) return
  displayName.value = data.displayName ?? ''
  bio.value = data.bio ?? ''
  street.value = data.street ?? ''
  postalCode.value = data.postalCode ?? ''
  city.value = data.city ?? ''
  country.value = data.country ?? ''
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
    profile.value = {
      ...profile.value!,
      displayName: updated.displayName,
      bio: updated.bio,
      tripCount: updated.tripCount,
      followerCount: updated.followerCount,
      followingCount: updated.followingCount,
    }
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
    const next = profile.value.following
      ? await unfollowUser(profile.value.username)
      : await followUser(profile.value.username)
    profile.value = next
  } catch (err) {
    console.error('Error toggling follow:', err)
    followError.value = 'Aktion fehlgeschlagen.'
  } finally {
    followBusy.value = false
  }
}

function onSearch(params: { query: string }) {
  searchTerm.value = params.query
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchTimeout = null
  }, searchDebounceMs)
}

function onFilter(params: { continent: Continent | ''; orderBy: OrderBy }) {
  selectedContinent.value = params.continent
  orderBy.value = params.orderBy
}

function toggleFilter() {
  showFilter.value = !showFilter.value
}

function toggleSearch() {
  showSearch.value = !showSearch.value
}

function signOut() {
  auth0.logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="relative z-10 mb-6 flex items-center gap-4">
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

        <div
          v-else-if="loadError"
          class="rounded-2xl border-2 border-red-100 bg-red-50 p-8 text-center"
        >
          <p class="text-red-600">{{ loadError }}</p>
          <button
            v-if="!usernameParam && auth0.isAuthenticated.value"
            class="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            @click="auth0.loginWithRedirect()"
          >
            Erneut anmelden
          </button>
        </div>

        <template v-else-if="profile">
          <!-- User Header -->
          <header class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profile.username"
              class="h-24 w-24 rounded-full object-cover shadow ring-2 ring-white"
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
                <span
                  ><strong class="text-gray-900">{{ profile.tripCount }}</strong> Reisen</span
                >
                <span
                  ><strong class="text-gray-900">{{ profile.followerCount }}</strong> Follower</span
                >
                <span
                  ><strong class="text-gray-900">{{ profile.followingCount }}</strong> folgt</span
                >
              </div>
            </div>

            <div class="flex gap-2">
              <button
                v-if="!profile.isMe"
                :disabled="followBusy"
                class="rounded-xl px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed"
                :class="[
                  followBusy
                    ? 'bg-blue-400'
                    : profile.following
                      ? 'bg-gray-300 hover:bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700',
                ]"
                @click="toggleFollow"
              >
                {{ profile.following ? 'Entfolgen' : 'Folgen' }}
              </button>
              <!-- Buttons nur für normale User (Staff hat Navbar-Dropdown) -->
              <template v-if="profile.isMe && !isStaff">
                <button
                  class="flex items-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                  @click="editMode = !editMode"
                >
                  <PencilIcon class="h-4 w-4" />
                  {{ editMode ? 'Zurück' : 'Profil bearbeiten' }}
                </button>
                <button
                  class="flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
                  @click="signOut"
                >
                  <ArrowRightOnRectangleIcon class="h-4 w-4" />
                  Abmelden
                </button>
              </template>
            </div>
          </header>
          <p v-if="followError" class="mb-4 text-sm text-red-500">{{ followError }}</p>

          <!-- Edit Form: normale User im editMode, Staff immer -->
          <form
            v-if="profile.isMe && (editMode || isStaff)"
            class="mb-8 flex flex-col gap-5 rounded-2xl border-2 border-gray-200 bg-white p-6"
            @submit.prevent="submit"
          >
            <div class="flex items-center gap-4">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="me?.username ?? 'Ich'"
                class="h-20 w-20 rounded-full object-cover shadow ring-2 ring-white"
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
                <label class="text-sm font-medium text-gray-700" for="profile-postal-code"
                  >PLZ</label
                >
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

          <!-- Trips Section: für Staff auf eigenem Profil nicht anzeigen -->
          <template v-if="!editMode && !(profile.isMe && isStaff)">
            <Map :trips="visibleTrips" class="my-6 h-128 w-full rounded-lg" />

            <div class="mb-3 flex gap-3">
              <Button
                v-if="profile.isMe"
                variant="primary"
                @click="router.push({ name: 'create-trip-step0' })"
              >
                <PlusIcon class="h-5 w-5" />
                <span class="ml-2">Hinzufügen</span>
              </Button>
              <Button variant="secondary" @click="toggleFilter">
                <FunnelIcon class="h-5 w-5" />
                <span class="ml-2">Filter</span>
              </Button>
              <Button variant="secondary" @click="toggleSearch">
                <MagnifyingGlassIcon class="h-5 w-5" />
                <span class="ml-2">Suchen</span>
              </Button>
            </div>

            <div v-if="showFilter" class="mb-6">
              <TripFilter :continent="selectedContinent" :order-by="orderBy" @filter="onFilter" />
            </div>
            <div v-if="showSearch" class="mb-6">
              <TripSearch :search-term="searchTerm" @search="onSearch" />
            </div>

            <div v-if="visibleTrips.length === 0" class="text-gray-500">
              Noch keine Reisen vorhanden.
            </div>
            <div v-else class="flex flex-1 flex-col justify-center pb-6">
              <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 sm:gap-3">
                <TravelCard
                  v-for="trip in visibleTrips"
                  :key="trip.id"
                  :id="trip.id"
                  :title="trip.title"
                  :image-url="trip.imageUrls[0]"
                />
              </div>
            </div>
          </template>
        </template>
      </main>

      <Footer />
    </div>
  </div>
</template>
