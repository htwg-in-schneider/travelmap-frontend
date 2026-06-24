<script setup lang="ts">
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import TravelCard from '@/components/TravelCard.vue'
import PostCard from '@/components/PostCard.vue'
import TripFilter from '@/components/TripFilter.vue'
import TripSearch from '@/components/TripSearch.vue'
import Map from '@/components/Map.vue'
import { type Trip } from '@/data'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { fetchUserTrips, fetchExplore } from '@/services/api'
import { useRoute, useRouter } from 'vue-router'
import { useUserRole } from '@/composables/useUserRole'
import { getContinentByCountryCode, type Continent } from '@/utils/continents'
import { parseDateTime } from '@/utils/date'
import { auth0, AUTH_UNAVAILABLE_MESSAGE, loginWithRedirectSafe } from '@/auth0'

type OrderBy = 'newest' | 'oldest' | 'most-commented'

const router = useRouter()
const route = useRoute()
const { username } = useUserRole()

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')
const showFilter = ref(false)
const showSearch = ref(false)
const searchTerm = ref('')
const selectedContinent = ref<Continent | ''>('')
const orderBy = ref<OrderBy>('newest')
const searchDebounceMs = 250

const guestTrips = ref<Trip[]>([])
const guestLoading = ref(false)
const guestError = ref('')
const authError = ref('')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

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

onMounted(async () => {
  if (auth0.isAuthenticated.value) {
    await loadTrips()
  } else {
    await loadGuestFeed()
  }
})

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})

watch(username, (newUsername) => {
  if (newUsername && trips.value.length === 0 && !loading.value) {
    loadTrips()
  }
})

watch(
  () => auth0.isAuthenticated.value,
  (isAuth) => {
    if (isAuth) {
      guestTrips.value = []
      loadTrips()
    } else {
      trips.value = []
      loadGuestFeed()
    }
  },
)

async function loadTrips() {
  loading.value = true
  error.value = ''
  try {
    if (!username.value) {
      trips.value = []
      return
    }
    trips.value = await fetchUserTrips(username.value)
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'Fehler beim Laden der Reisen.'
  } finally {
    loading.value = false
  }
}

async function loadGuestFeed() {
  guestLoading.value = true
  guestError.value = ''
  try {
    guestTrips.value = await fetchExplore()
  } catch (err) {
    console.error('Error fetching guest feed:', err)
    guestError.value = 'Fehler beim Laden des Feeds.'
  } finally {
    guestLoading.value = false
  }
}

function onSearch(params: { query: string }) {
  searchTerm.value = params.query

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

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

async function login() {
  try {
    authError.value = ''
    await loginWithRedirectSafe()
  } catch (err) {
    console.error('[Home] loginWithRedirect failed:', err)
    authError.value = err instanceof Error ? err.message : AUTH_UNAVAILABLE_MESSAGE
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1">
        <h2 class="mt-8 mb-6 text-2xl text-gray-900">
          {{ auth0.isAuthenticated.value ? 'Meine Reisen' : 'Entdecken' }}
        </h2>

        <template v-if="!auth0.isAuthenticated.value">
          <div
            v-if="route.query.message === 'auth-unavailable' || authError"
            class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {{ authError || AUTH_UNAVAILABLE_MESSAGE }}
          </div>
          <div class="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-gray-600">Melde dich an, um deine eigenen Reisen zu teilen.</p>
            <button
              class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              @click="login"
            >
              Anmelden
            </button>
          </div>

          <Map :trips="guestTrips" class="my-6 h-128 w-full rounded-lg" />

          <div v-if="guestLoading" class="text-gray-500">Laden...</div>
          <div v-else-if="guestError" class="text-red-500">{{ guestError }}</div>
          <div v-else-if="guestTrips.length === 0" class="text-gray-500">
            Noch keine Reisen vorhanden.
          </div>

          <div class="flex flex-col gap-6 pb-8">
            <PostCard v-for="trip in guestTrips" :key="trip.id" :trip="trip" />
          </div>
        </template>

        <template v-else>
          <Map :trips="visibleTrips" class="my-6 h-128 w-full rounded-lg" />
          <div class="mb-3 flex gap-3">
            <Button variant="primary" @click="router.push({ name: 'create-trip-step0' })">
              <PlusIcon class="h-5 w-5" />
              <span class="ml-2">Hinzufügen</span>
            </Button>
            <Button variant="secondary" @click="toggleFilter">
              <FunnelIcon class="h-5 w-5" />
              <span class="ml-2">Filter</span>
            </Button>
            <Button variant="secondary" @click="toggleSearch">
              <MagnifyingGlassIcon class="h-5 w-5" />
              <span class="ml-2">Suche</span>
            </Button>
          </div>
          <div v-if="showFilter" class="mb-6">
            <TripFilter :continent="selectedContinent" :order-by="orderBy" @filter="onFilter" />
          </div>
          <div v-if="showSearch" class="mb-6">
            <TripSearch :search-term="searchTerm" @search="onSearch" />
          </div>
          <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
          <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
          <div v-else-if="visibleTrips.length === 0" class="mt-8 text-gray-500">
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
      </main>

      <Footer />
    </div>
  </div>
</template>
