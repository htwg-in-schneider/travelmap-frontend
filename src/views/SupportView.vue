<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/vue/24/solid'
import { fetchSupportTrips, deleteSupportTrip, ApiError } from '@/services/api'
import { type Trip } from '@/data'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')
const deleteMessage = ref('')
const deleteError = ref('')
const searchTerm = ref('')
const deletingId = ref<number | null>(null)

const filteredTrips = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return trips.value
  return trips.value.filter(
    (t) =>
      t.title.toLowerCase().includes(term) ||
      (t.authorUsername ?? '').toLowerCase().includes(term) ||
      (t.countryCode ?? '').toLowerCase().includes(term),
  )
})

onMounted(async () => {
  try {
    trips.value = await fetchSupportTrips()
  } catch (e) {
    error.value = 'Fehler beim Laden der Trips.'
  } finally {
    loading.value = false
  }
})

async function removeTrip(trip: Trip) {
  const confirmed = window.confirm(
    `Soll der Trip „${trip.title}" von @${trip.authorUsername ?? '?'} wirklich gelöscht werden?`,
  )
  if (!confirmed) return

  deletingId.value = trip.id
  deleteError.value = ''
  deleteMessage.value = ''

  try {
    await deleteSupportTrip(trip.id)
    trips.value = trips.value.filter((t) => t.id !== trip.id)
    deleteMessage.value = 'Trip gelöscht.'
    setTimeout(() => { deleteMessage.value = '' }, 3000)
  } catch (err) {
    let message = 'Fehler beim Löschen.'
    if (err instanceof ApiError && err.status === 403) {
      message = 'Keine Berechtigung.'
    }
    deleteError.value = message
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold text-gray-900">Trip-Moderation</h1>
            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Support
            </span>
          </div>
          <span class="text-sm text-gray-500">{{ filteredTrips.length }} Trips</span>
        </div>

        <div class="mb-6 flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Suchen nach Trip, Username oder Ländercode"
            class="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div v-if="deleteMessage" class="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {{ deleteMessage }}
        </div>
        <div v-if="deleteError" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {{ deleteError }}
        </div>
        <div v-if="error" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {{ error }}
        </div>

        <div v-if="loading" class="text-gray-500">Laden...</div>

        <div
          v-else-if="filteredTrips.length === 0"
          class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500"
        >
          Keine Trips gefunden.
        </div>

        <div v-else class="flex flex-col gap-4">
          <!-- Desktop table -->
          <div class="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500">
                <tr>
                  <th class="px-4 py-3 font-medium">Trip</th>
                  <th class="px-4 py-3 font-medium">Autor</th>
                  <th class="px-4 py-3 font-medium">Land</th>
                  <th class="px-4 py-3 font-medium">Datum</th>
                  <th class="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="trip in filteredTrips"
                  :key="trip.id"
                  class="border-t border-gray-100"
                >
                  <td class="px-4 py-3 text-gray-900">
                    <div class="font-medium">{{ trip.title }}</div>
                  </td>
                  <td class="px-4 py-3 text-gray-600">@{{ trip.authorUsername ?? '–' }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ trip.countryCode ?? '–' }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ trip.date }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                        @click="router.push({ name: 'trip-detail', params: { id: trip.id } })"
                      >
                        <EyeIcon class="h-4 w-4" />
                        Ansehen
                      </button>
                      <button
                        class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        :disabled="deletingId === trip.id"
                        @click="removeTrip(trip)"
                      >
                        <TrashIcon class="h-4 w-4" />
                        {{ deletingId === trip.id ? 'Löschen…' : 'Löschen' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="flex flex-col gap-4 md:hidden">
            <div
              v-for="trip in filteredTrips"
              :key="trip.id"
              class="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div class="mb-1">
                <div class="font-medium text-gray-900">{{ trip.title }}</div>
                <div class="text-xs text-gray-500">
                  @{{ trip.authorUsername ?? '–' }} · {{ trip.countryCode ?? '–' }} · {{ trip.date }}
                </div>
              </div>
              <div class="mt-3 flex items-center gap-2">
                <button
                  class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                  @click="router.push({ name: 'trip-detail', params: { id: trip.id } })"
                >
                  <EyeIcon class="h-4 w-4" />
                  Ansehen
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  :disabled="deletingId === trip.id"
                  @click="removeTrip(trip)"
                >
                  <TrashIcon class="h-4 w-4" />
                  {{ deletingId === trip.id ? 'Löschen…' : 'Löschen' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
