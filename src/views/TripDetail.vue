<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { type Trip } from '@/data'
import { fetchTripById } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TripComments from '@/components/TripComments.vue'
import placeholder from '../../assets/placeholder.png'

const route = useRoute()
const trip = ref<Trip | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => loadTrip())

async function loadTrip() {
  const id = route.params.id
  if (!id) {
    error.value = 'Reise-ID fehlt.'
    loading.value = false
    return
  }
  try {
    trip.value = await fetchTripById(id)
    console.log(trip.value)
  } catch (err) {
    console.error('Error fetching trip:', err)
    error.value = 'Fehler beim Laden der Reise.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1">
        <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
        <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
        <div v-else-if="trip" class="mt-8">
          <div class="flex items-start justify-between">
            <h1 class="text-3xl text-gray-900">{{ trip.title }}</h1>
            <div
              v-if="trip.countryCode"
              class="h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-sm"
            >
              <span
                :class="'fi-' + trip.countryCode"
                style="display: block; width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat;"
              />
            </div>
          </div>
          <p class="mt-6 text-gray-700">{{ trip.text }}</p>

          <div class="mt-8">
            <p class="mb-4 text-right text-sm text-gray-500">{{ trip.date }}</p>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
              <img :src="placeholder" alt="placeholder" class="aspect-square w-full rounded-lg object-cover" />
            </div>
          </div>
        </div>

        <div v-else class="mt-8">
          <h1 class="text-2xl text-gray-900">Reise nicht gefunden</h1>
        </div>

        <TripComments v-if="trip" :tripId="(route.params.id as string | string[])" />
      </main>

      <Footer />
    </div>
  </div>
</template>
