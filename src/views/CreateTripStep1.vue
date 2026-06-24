<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, EyeIcon, LockClosedIcon } from '@heroicons/vue/24/solid'
import { useCreateTripStore } from '@/stores/createTrip'
import { computed, ref } from 'vue'
import {
  TRIP_TEXT_MAX_LENGTH,
  TRIP_TITLE_MAX_LENGTH,
  type TripFieldErrors,
} from '@/utils/tripValidation'
import { firstError } from '@/utils/formValidation'

const router = useRouter()
const store = useCreateTripStore()
const error = ref('')
const fieldErrors = ref<TripFieldErrors>({})

const canProceed = computed(() => store.title.trim().length > 0 && store.text.trim().length > 0)

function goBack() {
  router.push({ name: 'create-trip-step0' })
}

function next() {
  const title = store.title.trim()
  const text = store.text.trim()
  fieldErrors.value = {}
  if (!title) {
    fieldErrors.value.title = 'Titel ist ein Pflichtfeld.'
  }
  if (title.length > TRIP_TITLE_MAX_LENGTH) {
    fieldErrors.value.title = `Titel darf maximal ${TRIP_TITLE_MAX_LENGTH} Zeichen lang sein.`
  }
  if (!text) {
    fieldErrors.value.text = 'Beschreibung ist ein Pflichtfeld.'
  }
  if (text.length > TRIP_TEXT_MAX_LENGTH) {
    fieldErrors.value.text = `Beschreibung darf maximal ${TRIP_TEXT_MAX_LENGTH} Zeichen lang sein.`
  }
  const validationError = firstError(fieldErrors.value)
  if (validationError) {
    error.value = validationError
    return
  }
  error.value = ''
  if (canProceed.value) {
    router.push({ name: 'create-trip-step2' })
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
        <h1 class="text-2xl font-semibold text-gray-900">Neue Reise</h1>
      </div>

      <div class="-mt-36 flex flex-1 flex-col justify-center">
          <div class="flex flex-col gap-5">
          <div v-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ error }}
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="title">Titel *</label>
            <input
              id="title"
              v-model="store.title"
              type="text"
              required
              maxlength="120"
              :aria-invalid="fieldErrors.title ? 'true' : 'false'"
              aria-describedby="title-error"
              placeholder="z. B. Sommer in Japan"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
            />
            <p v-if="fieldErrors.title" id="title-error" class="text-sm text-red-500">
              {{ fieldErrors.title }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="description">Beschreibung *</label>
            <textarea
              id="description"
              v-model="store.text"
              placeholder="Was hast du erlebt?"
              rows="5"
              required
              maxlength="10000"
              :aria-invalid="fieldErrors.text ? 'true' : 'false'"
              aria-describedby="description-error"
              class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-600"
            />
            <p v-if="fieldErrors.text" id="description-error" class="text-sm text-red-500">
              {{ fieldErrors.text }}
            </p>
          </div>

          <fieldset class="flex flex-col gap-2">
            <legend class="text-sm font-medium text-gray-700">Sichtbarkeit</legend>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                :aria-pressed="store.publicTrip"
                :class="[
                  'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition',
                  store.publicTrip
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ]"
                @click="store.publicTrip = true"
              >
                <EyeIcon class="h-5 w-5" />
                Öffentlich
              </button>
              <button
                type="button"
                :aria-pressed="!store.publicTrip"
                :class="[
                  'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition',
                  !store.publicTrip
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ]"
                @click="store.publicTrip = false"
              >
                <LockClosedIcon class="h-5 w-5" />
                Privat
              </button>
            </div>
          </fieldset>
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
