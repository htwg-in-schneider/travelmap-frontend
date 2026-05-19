import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'travelmap-map-state'

function loadFromStorage(): { center: [number, number]; zoom: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      Array.isArray(parsed.center) &&
      parsed.center.length === 2 &&
      typeof parsed.center[0] === 'number' &&
      typeof parsed.center[1] === 'number' &&
      typeof parsed.zoom === 'number'
    ) {
      return { center: parsed.center as [number, number], zoom: parsed.zoom }
    }
  } catch {
    // ignore corrupt storage
  }
  return null
}

export const useMapStore = defineStore('map', () => {
  const stored = loadFromStorage()
  const center = ref<[number, number]>(stored?.center ?? [-71.06776, 42.35816])
  const zoom = ref(stored?.zoom ?? 1)

  function saveMapState(newCenter: [number, number], newZoom: number) {
    center.value = newCenter
    zoom.value = newZoom
  }

  watch(
    [center, zoom],
    () => {
      const payload = JSON.stringify({ center: center.value, zoom: zoom.value })
      localStorage.setItem(STORAGE_KEY, payload)
    },
    { deep: true }
  )

  return { center, zoom, saveMapState }
})
