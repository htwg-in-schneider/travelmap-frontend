<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { type Trip } from '@/data'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { fetchTripById } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TripComments from '@/components/TripComments.vue'
import placeholder from '../../assets/placeholder.png'
import { formatDateOnly } from '@/utils/date'

const route = useRoute()
const trip = ref<Trip | null>(null)
const loading = ref(true)
const error = ref('')
const currentImageIndex = ref(0)

const images = Array.from({ length: 6 }, () => placeholder)

const currentImage = computed(() => images[currentImageIndex.value] ?? placeholder)

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

function showPreviousImage() {
  currentImageIndex.value =
    currentImageIndex.value === 0 ? images.length - 1 : currentImageIndex.value - 1
}

function showNextImage() {
  currentImageIndex.value =
    currentImageIndex.value === images.length - 1 ? 0 : currentImageIndex.value + 1
}

function selectImage(index: number) {
  currentImageIndex.value = index
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
            <p class="mb-4 text-right text-sm text-gray-500">{{ formatDateOnly(trip.date) }}</p>
            <div class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="bg-gray-100 p-4 sm:p-5">
                <img
                  :src="currentImage"
                  :alt="`${trip.title} image ${currentImageIndex + 1}`"
                  class="mx-auto aspect-[4/3] w-full max-w-xl rounded-xl object-cover"
                />
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div class="text-sm text-gray-500">
                  {{ currentImageIndex + 1 }} / {{ images.length }}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="showPreviousImage"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon class="h-4 w-4" />
                  </button>

                  <button
                    v-for="(image, index) in images"
                    :key="`${image}-${index}`"
                    @click="selectImage(index)"
                    class="h-2.5 w-2.5 rounded-full transition"
                    :class="index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'"
                    :aria-label="`Go to image ${index + 1}`"
                  />

                  <button
                    @click="showNextImage"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
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
