<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, EyeIcon, LockClosedIcon } from '@heroicons/vue/24/solid'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { type Trip } from '@/data'
import { ApiError, fetchTripById, updateTrip, type CreateTripPayload } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import {
  TRIP_TEXT_MAX_LENGTH,
  TRIP_TITLE_MAX_LENGTH,
  validateTripPayloadFields,
  type TripFieldErrors,
} from '@/utils/tripValidation'
import { firstError } from '@/utils/formValidation'

const route = useRoute()
const router = useRouter()

const trip = ref<Trip | null>(null)
const loading = ref(true)
const loadError = ref('')

const title = ref('')
const text = ref('')
const date = ref('')
const countryCode = ref<string | null>(null)
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const publicTrip = ref(true)

const saving = ref(false)
const saveError = ref('')
const fieldErrors = ref<TripFieldErrors>({})

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const marker = ref<mapboxgl.Marker | null>(null)

const canSave = computed(() => title.value.trim().length > 0 && text.value.trim().length > 0)

async function reverseGeocode(lngVal: number, latVal: number) {
  const token = import.meta.env.VITE_MAPBOX_KEY
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngVal},${latVal}.json?access_token=${token}&types=country,region,place&language=de`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return

    const countryContext = feature.context?.find((c: { id: string }) => c.id.startsWith('country'))
    const code: string | undefined =
      countryContext?.short_code ?? feature.properties?.short_code

    if (code) {
      countryCode.value = code.slice(-2).toLowerCase()
    }
  } catch {
    // Geocoding nicht kritisch
  }
}

function handleMapClick(e: mapboxgl.MapMouseEvent) {
  const { lng: lngVal, lat: latVal } = e.lngLat
  lat.value = latVal
  lng.value = lngVal

  if (marker.value) {
    marker.value.setLngLat([lngVal, latVal])
  } else {
    marker.value = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([lngVal, latVal])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addTo(map.value as any)
  }

  reverseGeocode(lngVal, latVal)
}

function initMap() {
  if (!mapContainer.value || map.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
  const mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: lng.value !== null && lat.value !== null ? [lng.value, lat.value] : [10, 51],
    zoom: lng.value !== null ? 5 : 2,
  })
  map.value = mapInstance

  if (lat.value !== null && lng.value !== null) {
    marker.value = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([lng.value, lat.value])
      .addTo(mapInstance)
  }

  mapInstance.on('click', handleMapClick)
}

watch(mapContainer, () => {
  if (trip.value && mapContainer.value && !map.value) {
    initMap()
  }
})

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    loadError.value = 'Reise-ID fehlt.'
    loading.value = false
    return
  }

  try {
    const data = await fetchTripById(id)
    if (!data) {
      loadError.value = 'Reise nicht gefunden.'
      loading.value = false
      return
    }
    trip.value = data
    if (!data.canEdit) {
      await router.replace({
        name: 'trip-detail',
        params: { id: data.id.toString() },
        query: { message: 'edit-forbidden' },
      })
      return
    }
    title.value = data.title
    text.value = data.text
    date.value = data.date ? data.date.slice(0, 10) : ''
    countryCode.value = data.countryCode
    lat.value = data.latitude
    lng.value = data.longitude
    publicTrip.value = data.publicTrip

    await nextTick()
    initMap()
  } catch (err) {
    console.error('Error fetching trip:', err)
    loadError.value = 'Fehler beim Laden der Reise.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
  marker.value = null
})

async function submit() {
  if (!trip.value || !canSave.value) return
  saveError.value = ''
  fieldErrors.value = {}
  try {
    const payload: CreateTripPayload = {
      title: title.value.trim(),
      date: date.value ? new Date(date.value).toISOString() : trip.value.date,
      text: text.value.trim(),
      countryCode: countryCode.value,
      latitude: lat.value,
      longitude: lng.value,
      publicTrip: publicTrip.value,
    }
    fieldErrors.value = validateTripPayloadFields(payload)
    const validationError = firstError(fieldErrors.value)
    if (validationError) {
      saveError.value = validationError
      return
    }
    saving.value = true
    await updateTrip(trip.value.id, payload)
    router.push({ name: 'trip-detail', params: { id: trip.value.id.toString() } })
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      await router.replace({
        name: 'trip-detail',
        params: { id: trip.value.id.toString() },
        query: { message: 'edit-forbidden' },
      })
      return
    }
    if (err instanceof ApiError) {
      saveError.value = err.message
    } else {
      saveError.value = 'Fehler beim Speichern. Bitte versuche es erneut.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="relative z-10 mb-8 flex items-center gap-4">
          <button
            @click="$router.back()"
            class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeftIcon class="h-5 w-5" />
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Reise bearbeiten</h1>
        </div>

        <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
        <div v-else-if="loadError" class="mt-8 text-red-500">{{ loadError }}</div>
        <div v-else-if="trip" class="flex flex-col gap-8">
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="edit-title">Titel *</label>
              <input
                id="edit-title"
                v-model="title"
                type="text"
                required
                :maxlength="TRIP_TITLE_MAX_LENGTH"
                :aria-invalid="fieldErrors.title ? 'true' : 'false'"
                aria-describedby="edit-title-error"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
              />
              <p v-if="fieldErrors.title" id="edit-title-error" class="text-sm text-red-500">
                {{ fieldErrors.title }}
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="edit-date">Datum</label>
              <input
                id="edit-date"
                v-model="date"
                type="date"
                :aria-invalid="fieldErrors.date ? 'true' : 'false'"
                aria-describedby="edit-date-error"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
              />
              <p v-if="fieldErrors.date" id="edit-date-error" class="text-sm text-red-500">
                {{ fieldErrors.date }}
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="edit-description">Beschreibung *</label>
              <textarea
                id="edit-description"
                v-model="text"
                rows="5"
                required
                :maxlength="TRIP_TEXT_MAX_LENGTH"
                :aria-invalid="fieldErrors.text ? 'true' : 'false'"
                aria-describedby="edit-description-error"
                class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
              />
              <p
                v-if="fieldErrors.text"
                id="edit-description-error"
                class="text-sm text-red-500"
              >
                {{ fieldErrors.text }}
              </p>
            </div>

            <fieldset class="flex flex-col gap-2">
              <legend class="text-sm font-medium text-gray-700">Sichtbarkeit</legend>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  :aria-pressed="publicTrip"
                  :class="[
                    'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition',
                    publicTrip
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                  ]"
                  @click="publicTrip = true"
                >
                  <EyeIcon class="h-5 w-5" />
                  Öffentlich
                </button>
                <button
                  type="button"
                  :aria-pressed="!publicTrip"
                  :class="[
                    'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition',
                    !publicTrip
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                  ]"
                  @click="publicTrip = false"
                >
                  <LockClosedIcon class="h-5 w-5" />
                  Privat
                </button>
              </div>
            </fieldset>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Standort</label>
            <div ref="mapContainer" class="w-full rounded-2xl border border-gray-200" style="height: 320px" />
            <p class="text-sm text-gray-500">Tippe auf die Karte, um den Standort zu ändern.</p>
          </div>

          <div v-if="saveError" class="text-sm text-red-500">{{ saveError }}</div>

          <button
            @click="submit"
            :disabled="!canSave || saving"
            class="w-full rounded-xl px-6 py-3 text-base font-medium transition-colors focus:outline-none disabled:cursor-not-allowed"
            :class="
              canSave && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400'
            "
          >
            {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
          </button>
        </div>
        <div v-else class="mt-8">
          <h1 class="text-2xl text-gray-900">Reise nicht gefunden</h1>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
