<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useCreateTripStore } from '@/stores/createTrip'
import { createTrip } from '@/services/api'

const router = useRouter()
const store = useCreateTripStore()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const marker = ref<mapboxgl.Marker | null>(null)
const locationName = ref(store.title)
const saving = ref(false)
const error = ref('')

const canSave = computed(() => store.lat !== null && store.lng !== null && locationName.value.trim().length > 0)

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

async function reverseGeocode(lng: number, lat: number) {
  const token = import.meta.env.VITE_MAPBOX_KEY
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=country,region,place&language=de`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return

    if (!store.title.trim()) {
      locationName.value = feature.place_name_de ?? feature.place_name ?? ''
    } else {
      locationName.value = store.title
    }

    const countryContext = feature.context?.find((c: { id: string }) => c.id.startsWith('country'))
    const countryCode: string | undefined =
      countryContext?.short_code ?? feature.properties?.short_code

    if (countryCode) {
      store.flag = countryCodeToFlag(countryCode.slice(-2))
    }
  } catch {
    // Geocoding nicht kritisch — Nutzer kann manuell eingeben
  }
}

function handleMapClick(e: mapboxgl.MapMouseEvent) {
  const { lng, lat } = e.lngLat
  store.lat = lat
  store.lng = lng

  if (marker.value) {
    marker.value.setLngLat([lng, lat])
  } else {
    marker.value = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([lng, lat])
      .addTo(map.value!)
  }

  reverseGeocode(lng, lat)
}

onMounted(() => {
  if (!mapContainer.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
  const mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: store.lng !== null && store.lat !== null ? [store.lng, store.lat] : [10, 51],
    zoom: store.lng !== null ? 5 : 2,
  })
  map.value = mapInstance

  if (store.lat !== null && store.lng !== null) {
    marker.value = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([store.lng, store.lat])
      .addTo(mapInstance)
  }

  mapInstance.on('click', handleMapClick)
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
  marker.value = null
})

async function submit() {
  if (!canSave.value) return
  saving.value = true
  error.value = ''
  try {
    await createTrip({
      location: locationName.value.trim(),
      date: new Date().toISOString().slice(0, 10),
      text: store.text,
      flag: store.flag || '🌍',
    })
    store.reset()
    router.push({ name: 'home' })
  } catch {
    error.value = 'Fehler beim Speichern. Bitte versuche es erneut.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="flex items-center gap-4 px-6 py-6">
      <button
        @click="router.push({ name: 'create-trip-step1' })"
        class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
      >
        <ArrowLeftIcon class="h-5 w-5" />
      </button>
      <h1 class="text-2xl font-semibold text-gray-900">Standort wählen</h1>
    </div>

    <div ref="mapContainer" class="w-full flex-1" style="min-height: 55vh" />

    <div class="mx-auto w-full max-w-lg px-6 pt-5 pb-8">
      <p class="mb-2 text-sm text-gray-500">
        Tippe auf die Karte, um einen Standort zu markieren.
      </p>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700" for="location">Ort</label>
        <input
          id="location"
          v-model="locationName"
          type="text"
          placeholder="Ortsname"
          class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-600"
        />
      </div>

      <div v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</div>

      <button
        @click="submit"
        :disabled="!canSave || saving"
        class="mt-5 w-full rounded-xl px-6 py-3 text-base font-medium transition-colors focus:outline-none disabled:cursor-not-allowed"
        :class="
          canSave && !saving
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400'
        "
      >
        {{ saving ? 'Wird gespeichert…' : 'Reise hinzufügen' }}
      </button>
    </div>
  </div>
</template>
