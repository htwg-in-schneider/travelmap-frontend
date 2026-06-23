<script setup lang="ts">
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import TravelCard from '@/components/TravelCard.vue'
import TripFilter from '@/components/TripFilter.vue'
import TripSearch from '@/components/TripSearch.vue'
import Map from '@/components/Map.vue'
import { type Trip } from '@/data'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { fetchUserTrips } from '@/services/api'
import { useRouter } from 'vue-router'
import { useUserRole } from '@/composables/useUserRole'
import { getContinentByCountryCode, type Continent } from '@/utils/continents'
import { parseDateTime } from '@/utils/date'
import { auth0 } from '@/auth0'

type OrderBy = 'newest' | 'oldest' | 'most-commented'

const router = useRouter()
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
  await loadTrips()
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
    if (!isAuth) {
      trips.value = []
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
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1">
        <h2 class="mt-8 mb-6 text-2xl text-gray-900">Meine Reisen</h2>

        <template v-if="!auth0.isAuthenticated.value">
          <p class="mb-8 text-gray-600">
            Melde dich an, um deine eigenen Reisen zu sehen.
          </p>
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
              <span class="ml-2">Suchen</span>
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
