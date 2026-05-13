<template>
  <div id="map-container" ref="mapContainer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)

onMounted(() => {
  if (!mapContainer.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.06776, 42.35816],
    zoom: 1,
  })
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
})
</script>
