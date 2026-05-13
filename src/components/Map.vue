<template>
  <div id="map-container" ref="mapContainer" />
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default {
  mounted() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-71.06776, 42.35816], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 1, // starting zoom
    })
  },

  unmounted() {
    this.map?.remove()
    this.map = null
  },
}
</script>
