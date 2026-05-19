import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const center = ref<[number, number]>([-71.06776, 42.35816])
  const zoom = ref(1)

  function saveMapState(newCenter: [number, number], newZoom: number) {
    center.value = newCenter
    zoom.value = newZoom
  }

  return { center, zoom, saveMapState }
})
