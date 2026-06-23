<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import PostCard from '@/components/PostCard.vue'
import { type Trip } from '@/data'
import { fetchFeed } from '@/services/api'
import { auth0 } from '@/auth0'

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    trips.value = await fetchFeed()
  } catch (err) {
    console.error('Error fetching feed:', err)
    error.value = 'Fehler beim Laden des Feeds.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-20">
      <Navbar />

      <main class="flex-1">
        <h2 class="mt-8 mb-6 text-2xl text-gray-900">Feed</h2>

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <template v-else-if="!auth0.isAuthenticated.value">
          <p class="mb-8 text-gray-600">
            Melde dich an, um die Reisen der Personen zu sehen, denen du folgst. Bis dahin zeigen
            wir dir hier alle öffentlichen Reisen.
          </p>
          <div v-if="trips.length === 0" class="text-gray-500">
            Noch keine Reisen vorhanden.
          </div>
        </template>
        <div v-else-if="trips.length === 0" class="text-gray-500">
          Du folgst noch niemandem. Schau dich unter
          <router-link :to="{ name: 'explore' }" class="font-medium text-blue-600 hover:underline">
            Entdecken
          </router-link>
          um und folge Reisenden, um ihre Beiträge hier zu sehen.
        </div>

        <div class="flex flex-col gap-6 pb-8">
          <PostCard v-for="trip in trips" :key="trip.id" :trip="trip" />
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>