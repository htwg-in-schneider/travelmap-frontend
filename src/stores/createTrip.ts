import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateTripStore = defineStore('createTrip', () => {
  const title = ref('')
  const text = ref('')
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const countryCode = ref('')

  function reset() {
    title.value = ''
    text.value = ''
    lat.value = null
    lng.value = null
    countryCode.value = ''
  }

  return { title, text, lat, lng, countryCode, reset }
})
