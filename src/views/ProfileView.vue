<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import { fetchMe, updateMe } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

const displayName = ref('')
const street = ref('')
const postalCode = ref('')
const city = ref('')
const country = ref('')

onMounted(async () => {
  try {
    const me = await fetchMe()
    displayName.value = me.displayName ?? ''
    street.value = me.street ?? ''
    postalCode.value = me.postalCode ?? ''
    city.value = me.city ?? ''
    country.value = me.country ?? ''
  } catch (err) {
    console.error('Error fetching profile:', err)
    loadError.value = 'Fehler beim Laden des Profils.'
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    await updateMe({
      displayName: displayName.value.trim(),
      street: street.value.trim() || null,
      postalCode: postalCode.value.trim() || null,
      city: city.value.trim() || null,
      country: country.value.trim() || null,
    })
    saved.value = true
  } catch (err) {
    console.error('Error saving profile:', err)
    saveError.value = 'Fehler beim Speichern. Bitte versuche es erneut.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="relative z-10 mb-8 flex items-center gap-4">
          <button
            @click="router.back()"
            class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeftIcon class="h-5 w-5" />
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Mein Profil</h1>
        </div>

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="loadError" class="text-red-500">{{ loadError }}</div>
        <form v-else class="flex flex-col gap-5" @submit.prevent="submit">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-name">Name</label>
            <input
              id="profile-name"
              v-model="displayName"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-street">Straße</label>
            <input
              id="profile-street"
              v-model="street"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div class="flex gap-4">
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="profile-postal-code">PLZ</label>
              <input
                id="profile-postal-code"
                v-model="postalCode"
                type="text"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>
            <div class="flex flex-[2] flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700" for="profile-city">Ort</label>
              <input
                id="profile-city"
                v-model="city"
                type="text"
                class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700" for="profile-country">Land</label>
            <input
              id="profile-country"
              v-model="country"
              type="text"
              class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div v-if="saveError" class="text-sm text-red-500">{{ saveError }}</div>
          <div v-if="saved" class="text-sm text-green-600">Profil gespeichert.</div>

          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded-xl px-6 py-3 text-base font-medium text-white transition-colors disabled:cursor-not-allowed"
            :class="saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'"
          >
            {{ saving ? 'Wird gespeichert…' : 'Speichern' }}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  </div>
</template>
