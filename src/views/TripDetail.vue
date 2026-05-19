<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { type Trip } from '@/data'
import { fetchTripById } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

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
    <div class="mx-auto w-full max-w-4xl px-6 pt-20">
      <Navbar />

      <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
      <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
      <div v-else-if="trip" class="mt-8">
        <div class="flex items-center gap-3">
          <span class="text-4xl">{{ trip.flag }}</span>
          <h1 class="text-3xl text-gray-900">{{ trip.location }}</h1>
        </div>
        <p class="mt-2 text-gray-500">{{ trip.date }}</p>
        <p class="mt-6 text-gray-700">{{ trip.text }}</p>
      </div>

      <div v-else class="mt-8">
        <h1 class="text-2xl text-gray-900">Reise nicht gefunden</h1>
      </div>

      <Footer />
    </div>
  </div>
</template>
