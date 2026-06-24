import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateTripStore = defineStore('createTrip', () => {
  const title = ref('')
  const text = ref('')
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const countryCode = ref('')
  const publicTrip = ref(true)
  const images = ref<File[]>([])

  function addImages(files: File[]) {
    images.value.push(...files)
  }

  function removeImage(index: number) {
    images.value.splice(index, 1)
  }

  function reset() {
    title.value = ''
    text.value = ''
    lat.value = null
    lng.value = null
    countryCode.value = ''
    publicTrip.value = true
    images.value = []
  }

  return { title, text, lat, lng, countryCode, publicTrip, images, addImages, removeImage, reset }
})
