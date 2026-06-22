<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useCreateTripStore } from '@/stores/createTrip'
import { computed, ref } from 'vue'

const router = useRouter()
const store = useCreateTripStore()
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGES = 10

const canProceed = computed(() => store.images.length > 0)

const previewUrls = computed(() =>
  store.images.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    size: formatFileSize(file.size),
  })),
)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name} ist kein unterstütztes Bildformat (JPEG, PNG, WebP, GIF).`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} ist größer als 10 MB.`
  }
  return null
}

function handleFiles(files: FileList | null) {
  if (!files) return

  const newFiles: File[] = []
  const errors: string[] = []

  for (const file of Array.from(files)) {
    const error = validateFile(file)
    if (error) {
      errors.push(error)
    } else {
      newFiles.push(file)
    }
  }

  const total = store.images.length + newFiles.length
  if (total > MAX_IMAGES) {
    errors.push(`Maximal ${MAX_IMAGES} Bilder pro Reise.`)
    newFiles.splice(MAX_IMAGES - store.images.length)
  }

  if (errors.length > 0) {
    alert(errors.join('\n'))
  }

  if (newFiles.length > 0) {
    store.addImages(newFiles)
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  handleFiles(target.files)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  handleFiles(event.dataTransfer?.files ?? null)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function removeImage(index: number) {
  store.removeImage(index)
}

function goBack() {
  store.reset()
  router.push({ name: 'home' })
}

function next() {
  if (canProceed.value) {
    router.push({ name: 'create-trip-step1' })
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-6">
      <div class="relative z-10 mb-8 flex items-center gap-4">
        <button
          @click="goBack"
          class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <h1 class="text-2xl font-semibold text-gray-900">Bilder hochladen</h1>
      </div>

      <div class="-mt-36 flex flex-1 flex-col justify-center">
        <div
          @click="fileInput?.click()"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          :class="[
            'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
            dragOver
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50',
          ]"
        >
          <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
          <p class="mt-3 text-sm font-medium text-gray-900">
            Bilder hierher ziehen oder klicken zum Auswählen
          </p>
          <p class="mt-1 text-xs text-gray-500">
            JPEG, PNG, WebP oder GIF – maximal 10 MB pro Bild
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="store.images.length > 0" class="mt-6 grid grid-cols-3 gap-3">
          <div
            v-for="(preview, index) in previewUrls"
            :key="preview.url"
            class="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
          >
            <img :src="preview.url" :alt="preview.name" class="h-full w-full object-cover" />
            <button
              @click.stop="removeImage(index)"
              class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Bild entfernen"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
            <div
              class="absolute right-0 bottom-0 left-0 truncate bg-black/40 px-2 py-1 text-[10px] text-white"
            >
              {{ preview.size }}
            </div>
          </div>
        </div>

        <div class="mt-8">
          <button
            @click="next"
            :disabled="!canProceed"
            class="w-full rounded-xl px-6 py-3 text-base font-medium transition-colors focus:outline-none disabled:cursor-not-allowed"
            :class="
              canProceed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'
            "
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
