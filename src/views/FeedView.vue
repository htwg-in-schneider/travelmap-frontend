<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import PostCard from '@/components/PostCard.vue'
import Map from '@/components/Map.vue'
import { type Trip } from '@/data'
import { fetchFeed } from '@/services/api'
import { useUserRole } from '@/composables/useUserRole'

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')
const { username } = useUserRole()

const feedTrips = computed(() => {
  if (!username.value) return trips.value
  return trips.value.filter((t) => t.authorUsername !== username.value)
})

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

        <Map :trips="feedTrips" class="my-6 h-96 w-full rounded-lg" />

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <div v-else-if="feedTrips.length === 0" class="text-gray-500">
          Keine Reisen von Accounts vorhanden, denen du folgst.
        </div>

        <div class="flex flex-col gap-6 pb-8">
          <PostCard v-for="trip in feedTrips" :key="trip.id" :trip="trip" />
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
