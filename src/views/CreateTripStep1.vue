<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import { useCreateTripStore } from '@/stores/createTrip'
import { computed } from 'vue'

const router = useRouter()
const store = useCreateTripStore()

const canProceed = computed(() => store.title.trim().length > 0 && store.text.trim().length > 0)

function goBack() {
  store.reset()
  router.push({ name: 'home' })
}

function next() {
  if (canProceed.value) {
    router.push({ name: 'create-trip-step2' })
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-6">
      <div class="mb-8 flex items-center gap-4">
        <button
          @click="goBack"
          class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <h1 class="text-2xl font-semibold text-gray-900">Neue Reise</h1>
      </div>

      <div class="-mt-36 flex flex-1 flex-col justify-center">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="title">Titel</label>
            <input
              id="title"
              v-model="store.title"
              type="text"
              placeholder="z. B. Sommer in Japan"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="description">Beschreibung</label>
            <textarea
              id="description"
              v-model="store.text"
              placeholder="Was hast du erlebt?"
              rows="5"
              class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
            />
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
