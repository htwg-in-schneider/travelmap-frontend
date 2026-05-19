<template>
  <div id="map-container" ref="mapContainer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useMapStore } from '@/stores/map'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const mapStore = useMapStore()

onMounted(() => {
  if (!mapContainer.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
  const mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: mapStore.center,
    zoom: mapStore.zoom,
  })
  map.value = mapInstance

  mapInstance.on('moveend', () => {
    const newCenter = mapInstance.getCenter()
    const newZoom = mapInstance.getZoom()
    mapStore.saveMapState([newCenter.lng, newCenter.lat], newZoom)
  })
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
})
</script>
