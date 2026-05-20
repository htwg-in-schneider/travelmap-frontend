<script setup lang="ts">
import { PlusIcon, FunnelIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import TravelCard from '@/components/TravelCard.vue'
import TripFilter from '@/components/TripFilter.vue'
import Map from '@/components/Map.vue'
import { userName, type Trip } from '@/data'
import { ref, onMounted } from 'vue'
import { fetchTrips as apiFetchTrips } from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')
const showFilter = ref(false)

onMounted(async () => loadTrips())

async function loadTrips(params?: { location?: string }) {
  loading.value = true
  error.value = ''
  try {
    trips.value = await apiFetchTrips(params)
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'Fehler beim Laden der Reisen.'
  } finally {
    loading.value = false
  }
}

function onSearch(params: { name: string }) {
  loadTrips({ location: params.name || undefined })
}

function toggleFilter() {
  showFilter.value = !showFilter.value
  if (!showFilter.value) {
    loadTrips()
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto w-full max-w-4xl px-6 pt-20">
      <Navbar />

      <h2 class="mt-8 mb-6 text-2xl text-gray-900">Willkommen zurück, {{ userName }}! 🌍</h2>

      <Map :trips="trips" class="my-6 h-128 w-full rounded-lg" />
      <div class="mb-3 flex gap-3">
        <Button variant="primary" @click="router.push({ name: 'create-trip-step1' })"><PlusIcon class="h-5 w-5" /></Button>
        <Button variant="secondary" @click="toggleFilter"><FunnelIcon class="h-8 w-5" /></Button>
      </div>
      <div v-if="showFilter" class="mb-6">
        <TripFilter @search="onSearch" />
      </div>
      <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
      <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
      <div v-else class="flex flex-1 flex-col justify-center pb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TravelCard
            v-for="trip in trips"
            :key="trip.id"
            :id="trip.id"
            :location="trip.location"
            :date="trip.date"
            :text="trip.text"
          />
        </div>
      </div>

      <Footer />
    </div>
  </div>
</template>
