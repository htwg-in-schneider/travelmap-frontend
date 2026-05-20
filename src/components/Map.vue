<template>
  <div id="map-container" ref="mapContainer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useMapStore } from '@/stores/map'
import type { Trip } from '@/data'

const props = defineProps<{
  trips: Trip[]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const mapStore = useMapStore()
const markers = ref<mapboxgl.Marker[]>([])
const router = useRouter()

function clearMarkers() {
  markers.value.forEach((m) => m.remove())
  markers.value = []
}

function addTripMarkers() {
  if (!map.value) return
  clearMarkers()

  props.trips.forEach((trip) => {
    if (trip.latitude == null || trip.longitude == null) return

    const el = document.createElement('div')
    el.className = 'trip-marker'
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = '#ffffff'
    el.style.border = '2px solid #e5e7eb'
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.overflow = 'hidden'
    el.style.cursor = 'pointer'

    if (trip.countryCode) {
      const flagEl = document.createElement('span')
      flagEl.className = `fi fi-${trip.countryCode}`
      flagEl.style.width = '100%'
      flagEl.style.height = '100%'
      flagEl.style.backgroundSize = 'cover'
      flagEl.style.backgroundPosition = 'center'
      el.appendChild(flagEl)
    } else {
      el.style.backgroundColor = '#2563eb'
      el.style.border = '3px solid white'
    }

    const marker = new (mapboxgl.Marker as any)({ element: el })
      .setLngLat([trip.longitude, trip.latitude])
      .addTo(map.value as any)

    const popup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setHTML(
      `<div class="px-2 py-1 text-sm font-medium text-gray-900">${trip.title}</div>`,
    )

    el.addEventListener('click', () => {
      router.push({ name: 'trip-detail', params: { id: trip.id.toString() } })
    })

    marker.setPopup(popup)
    ;(el as any).addEventListener('mouseenter', () => marker.togglePopup())
    ;(el as any).addEventListener('mouseleave', () => marker.togglePopup())

    markers.value.push(marker)
  })
}

onMounted(() => {
  if (!mapContainer.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
  const mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: mapStore.center,
    zoom: mapStore.zoom,
    projection: 'globe',
  })
  map.value = mapInstance

  mapInstance.on('moveend', () => {
    const newCenter = mapInstance.getCenter()
    const newZoom = mapInstance.getZoom()
    mapStore.saveMapState([newCenter.lng, newCenter.lat], newZoom)
  })

  if (mapStore.pendingCenter && mapStore.pendingZoom !== null) {
    mapInstance.flyTo({
      center: mapStore.pendingCenter,
      zoom: mapStore.pendingZoom,
      essential: true,
    })
    mapStore.clearPendingFlyTo()
  }

  addTripMarkers()
})

watch(() => props.trips, addTripMarkers, { deep: true })

onUnmounted(() => {
  clearMarkers()
  map.value?.remove()
  map.value = null
})
</script>
