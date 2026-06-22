import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateTripStore = defineStore('createTrip', () => {
  const title = ref('')
  const text = ref('')
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const countryCode = ref('')
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
    images.value = []
  }

  return { title, text, lat, lng, countryCode, images, addImages, removeImage, reset }
})
