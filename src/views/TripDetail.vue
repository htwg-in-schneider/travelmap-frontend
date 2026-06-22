<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Trip } from '@/data'
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { fetchTripById, deleteTrip } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TripComments from '@/components/TripComments.vue'
import placeholder from '../../assets/placeholder.png'
import { formatDateOnly } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const trip = ref<Trip | null>(null)
const loading = ref(true)
const error = ref('')
const currentImageIndex = ref(0)
const showDeleteDialog = ref(false)
const deleting = ref(false)

const images = computed(() => trip.value?.imageUrls ?? [])

const currentImage = computed(() => images.value[currentImageIndex.value] ?? placeholder)

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
  } catch (err) {
    console.error('Error fetching trip:', err)
    error.value = 'Fehler beim Laden der Reise.'
  } finally {
    loading.value = false
  }
}

function showPreviousImage() {
  currentImageIndex.value =
    currentImageIndex.value === 0 ? images.value.length - 1 : currentImageIndex.value - 1
}

function showNextImage() {
  currentImageIndex.value =
    currentImageIndex.value === images.value.length - 1 ? 0 : currentImageIndex.value + 1
}

function selectImage(index: number) {
  currentImageIndex.value = index
}

function goToEdit() {
  if (!trip.value) return
  router.push({ name: 'edit-trip', params: { id: trip.value.id.toString() } })
}

function openDeleteDialog() {
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
}

async function confirmDelete() {
  if (!trip.value) return
  deleting.value = true
  try {
    await deleteTrip(trip.value.id)
    router.push({ name: 'home' })
  } catch (err) {
    console.error('Error deleting trip:', err)
    deleting.value = false
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
                style="
                  display: block;
                  width: 100%;
                  height: 100%;
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                "
              />
            </div>
          </div>

          <p class="mt-6 text-gray-700">{{ trip.text }}</p>

          <div v-if="images.length > 0" class="mt-8">
            <div
              class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div class="bg-gray-100 p-4 sm:p-5">
                <img
                  :src="currentImage"
                  :alt="`${trip.title} Bild ${currentImageIndex + 1}`"
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
                    aria-label="Vorheriges Bild"
                  >
                    <ChevronLeftIcon class="h-4 w-4" />
                  </button>

                  <button
                    v-for="(image, index) in images"
                    :key="`${image}-${index}`"
                    @click="selectImage(index)"
                    class="h-2.5 w-2.5 rounded-full transition"
                    :class="
                      index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    "
                    :aria-label="`Zu Bild ${index + 1} wechseln`"
                  />

                  <button
                    @click="showNextImage"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    aria-label="Nächstes Bild"
                  >
                    <ChevronRightIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div v-if="trip.canEdit" class="flex items-center gap-2">
              <button
                @click="goToEdit"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                aria-label="Bearbeiten"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="openDeleteDialog"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-red-600 transition hover:border-red-600 hover:bg-red-50"
                aria-label="Löschen"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
            <p class="ml-auto text-right text-sm text-gray-500">{{ formatDateOnly(trip.date) }}</p>
          </div>
        </div>

        <div v-else class="mt-8">
          <h1 class="text-2xl text-gray-900">Reise nicht gefunden</h1>
        </div>

        <TripComments v-if="trip" :tripId="route.params.id as string | string[]" />

        <!-- Delete Confirmation Dialog -->
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click.self="closeDeleteDialog"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 class="text-lg font-semibold text-gray-900">Reise löschen?</h2>
            <p class="mt-2 text-sm text-gray-600">
              Bist du sicher, dass du diese Reise löschen möchtest? Alle zugehörigen Kommentare
              werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                @click="closeDeleteDialog"
                class="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Abbrechen
              </button>
              <button
                @click="confirmDelete"
                :disabled="deleting"
                class="rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed"
                :class="deleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'"
              >
                {{ deleting ? 'Wird gelöscht…' : 'Löschen' }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
