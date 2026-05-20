<script setup lang="ts">
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import TravelCard from '@/components/TravelCard.vue'
import TripFilter from '@/components/TripFilter.vue'
import TripSearch from '@/components/TripSearch.vue'
import Map from '@/components/Map.vue'
import { userName, type Trip } from '@/data'
import { computed, onMounted, ref } from 'vue'
import { fetchTrips as apiFetchTrips } from '@/services/api'
import { useRouter } from 'vue-router'
import { getContinentByCountryCode, type Continent } from '@/utils/continents'

type OrderBy = 'newest' | 'oldest' | 'most-commented' | ''

const router = useRouter()

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')
const showFilter = ref(false)
const showSearch = ref(false)
const searchTerm = ref('')
const selectedContinent = ref<Continent | ''>('')
const orderBy = ref<OrderBy>('')

const visibleTrips = computed(() => {
  let nextTrips = [...trips.value]

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
      const leftTime = Number.isNaN(Date.parse(left.date)) ? 0 : Date.parse(left.date)
      const rightTime = Number.isNaN(Date.parse(right.date)) ? 0 : Date.parse(right.date)

      return orderBy.value === 'oldest' ? leftTime - rightTime : rightTime - leftTime
    })
  }

  return nextTrips
})

onMounted(async () => loadTrips())

async function loadTrips() {
  loading.value = true
  error.value = ''
  try {
    trips.value = await apiFetchTrips({ q: searchTerm.value.trim() || undefined })
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'Fehler beim Laden der Reisen.'
  } finally {
    loading.value = false
  }
}

function onSearch(params: { query: string }) {
  searchTerm.value = params.query
  loadTrips()
}

function onFilter(params: {
  continent: Continent | ''
  orderBy: OrderBy
}) {
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
        <h2 class="mt-8 mb-6 text-2xl text-gray-900">Willkommen zurück, {{ userName }}! 🌍</h2>

        <Map :trips="visibleTrips" class="my-6 h-128 w-full rounded-lg" />
        <div class="mb-3 flex gap-3">
          <Button variant="primary" @click="router.push({ name: 'create-trip-step1' })">
            <PlusIcon class="h-5 w-5" />
            <span class="ml-2">Add</span>
          </Button>
          <Button variant="secondary" @click="toggleFilter">
            <FunnelIcon class="h-5 w-5" />
            <span class="ml-2">Filter</span>
          </Button>
          <Button variant="secondary" @click="toggleSearch">
            <MagnifyingGlassIcon class="h-5 w-5" />
            <span class="ml-2">Search</span>
          </Button>
        </div>
        <div v-if="showFilter" class="mb-6">
          <TripFilter
            :continent="selectedContinent"
            :order-by="orderBy"
            @filter="onFilter"
          />
        </div>
        <div v-if="showSearch" class="mb-6">
          <TripSearch :search-term="searchTerm" @search="onSearch" />
        </div>
        <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
        <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
        <div v-else class="flex flex-1 flex-col justify-center pb-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TravelCard
              v-for="trip in visibleTrips"
              :key="trip.id"
              :id="trip.id"
              :title="trip.title"
              :date="trip.date"
              :text="trip.text"
              :comment-count="trip.commentCount"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
