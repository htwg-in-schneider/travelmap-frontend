<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Trip } from '@/data'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/solid'
import { ApiError, fetchTripById, deleteTrip } from '@/services/api'
import { useSocialStore } from '@/stores/social'
import { auth0, AUTH_UNAVAILABLE_MESSAGE, loginWithRedirectSafe } from '@/auth0'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import TripComments from '@/components/TripComments.vue'
import OptionsMenu from '@/components/OptionsMenu.vue'
import placeholder from '../../assets/placeholder.png'
import { formatDateOnly } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const social = useSocialStore()
const { isAuthenticated } = auth0
const trip = ref<Trip | null>(null)
const loading = ref(true)
const error = ref('')
const currentImageIndex = ref(0)
const showDeleteDialog = ref(false)
const deleting = ref(false)
const likeBusy = ref(false)

const images = computed(() => trip.value?.imageUrls ?? [])

const currentImage = computed(() => images.value[currentImageIndex.value] ?? placeholder)

const likeState = computed(() => (trip.value ? social.readLike(trip.value) : { likeCount: 0, likedByMe: false }))
const actionMessage = computed(() => {
  if (route.query.message === 'edit-forbidden') {
    return 'Du darfst diese Reise nicht bearbeiten.'
  }
  return ''
})

async function login() {
  try {
    await loginWithRedirectSafe()
  } catch (err) {
    console.error('[TripDetail] loginWithRedirect failed:', err)
    error.value = err instanceof Error ? err.message : AUTH_UNAVAILABLE_MESSAGE
  }
}

async function toggleLike() {
  if (!isAuthenticated.value) {
    await login()
    return
  }
  if (!trip.value || likeBusy.value) return
  likeBusy.value = true
  try {
    await social.toggleLike(trip.value)
  } catch (err) {
    console.error('Failed to toggle like:', err)
    if (err instanceof ApiError && err.status === 401) {
      error.value = 'Bitte melde dich an, um Reisen zu liken.'
    } else if (err instanceof ApiError) {
      error.value = err.message
    } else {
      error.value = 'Fehler beim Liken der Reise.'
    }
  } finally {
    likeBusy.value = false
  }
}

onMounted(async () => loadTrip())

async function loadTrip() {
  const id = route.params.id
  if (!id) {
    error.value = 'Reise-ID fehlt.'
    loading.value = false
    return
  }
  try {
    trip.value = await fetchTripById(id)
  } catch (err) {
    console.error('Error fetching trip:', err)
    error.value = 'Fehler beim Laden der Reise.'
  } finally {
    loading.value = false
  }
}

function showPreviousImage() {
  currentImageIndex.value =
    currentImageIndex.value === 0 ? images.value.length - 1 : currentImageIndex.value - 1
}

function showNextImage() {
  currentImageIndex.value =
    currentImageIndex.value === images.value.length - 1 ? 0 : currentImageIndex.value + 1
}

function selectImage(index: number) {
  currentImageIndex.value = index
}

function goToEdit() {
  if (!trip.value) return
  router.push({ name: 'edit-trip', params: { id: trip.value.id.toString() } })
}

function openDeleteDialog() {
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
}

async function confirmDelete() {
  if (!trip.value) return
  deleting.value = true
  try {
    await deleteTrip(trip.value.id)
    router.push({ name: 'home' })
  } catch (err) {
    console.error('Error deleting trip:', err)
    if (err instanceof ApiError && err.status === 403) {
      error.value = 'Du darfst diese Reise nicht löschen.'
    } else if (err instanceof ApiError && err.status === 401) {
      error.value = 'Bitte melde dich an, um Reisen zu löschen.'
    } else if (err instanceof ApiError) {
      error.value = err.message
    } else {
      error.value = 'Fehler beim Löschen der Reise.'
    }
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1">
        <div v-if="actionMessage" class="mt-8 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ actionMessage }}
        </div>
        <div v-if="loading" class="mt-8 text-gray-500">Laden...</div>
        <div v-else-if="error" class="mt-8 text-red-500">{{ error }}</div>
        <div v-else-if="trip" class="mt-8">
          <router-link
            v-if="trip.authorUsername"
            :to="{ name: 'profile-username', params: { username: trip.authorUsername } }"
            class="mb-4 flex items-center gap-3"
          >
            <img
              v-if="trip.authorAvatarUrl"
              :src="trip.authorAvatarUrl"
              :alt="trip.authorUsername"
              class="h-10 w-10 rounded-full object-cover"
            />
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
            >
              {{ trip.authorUsername.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">@{{ trip.authorUsername }}</div>
              <div v-if="trip.ownerName" class="text-xs text-gray-500">{{ trip.ownerName }}</div>
            </div>
          </router-link>

          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl text-gray-900">{{ trip.title }}</h1>
              <span
                v-if="trip.publicTrip === false"
                class="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                <LockClosedIcon class="h-3.5 w-3.5" />
                Privat
              </span>
            </div>
            <div
              v-if="trip.countryCode"
              class="h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-sm"
            >
              <span
                :class="'fi-' + trip.countryCode.toLowerCase()"
                style="
                  display: block;
                  width: 100%;
                  height: 100%;
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                "
              />
            </div>
          </div>

          <p class="mt-6 text-gray-700">{{ trip.text }}</p>

          <div v-if="images.length > 0" class="mt-8">
            <div
              class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div class="bg-gray-100 p-4 sm:p-5">
                <img
                  :src="currentImage"
                  :alt="`${trip.title} Bild ${currentImageIndex + 1}`"
                  class="mx-auto aspect-[4/3] w-full max-w-xl rounded-xl object-cover"
                />
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div class="text-sm text-gray-500">
                  {{ currentImageIndex + 1 }} / {{ images.length }}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="showPreviousImage"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    aria-label="Vorheriges Bild"
                  >
                    <ChevronLeftIcon class="h-4 w-4" />
                  </button>

                  <button
                    v-for="(image, index) in images"
                    :key="`${image}-${index}`"
                    @click="selectImage(index)"
                    class="h-2.5 w-2.5 rounded-full transition"
                    :class="
                      index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    "
                    :aria-label="`Zu Bild ${index + 1} wechseln`"
                  />

                  <button
                    @click="showNextImage"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    aria-label="Nächstes Bild"
                  >
                    <ChevronRightIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                :disabled="likeBusy"
                class="flex items-center gap-1.5 transition-colors disabled:opacity-50"
                :class="[
                  isAuthenticated
                    ? likeState.likedByMe
                      ? 'text-red-600'
                      : 'text-gray-700 hover:text-red-600'
                    : 'text-gray-400 hover:text-gray-500',
                ]"
                :title="isAuthenticated ? undefined : 'Anmelden, um zu liken'"
                @click="toggleLike"
                :aria-pressed="likeState.likedByMe"
                aria-label="Like"
              >
                <HeartIcon class="h-7 w-7" :class="likeState.likedByMe ? 'fill-red-600' : 'fill-none'" />
                <span class="text-sm font-medium">{{ likeState.likeCount }}</span>
              </button>
              <span class="text-sm text-gray-500">{{ trip.commentCount }} Kommentare</span>
            </div>
            <OptionsMenu v-if="trip.canEdit" label="Reiseoptionen">
              <template #default="{ close }">
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                  role="menuitem"
                  @click="close(); goToEdit()"
                >
                  <PencilIcon class="h-4 w-4" />
                  Bearbeiten
                </button>
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  role="menuitem"
                  @click="close(); openDeleteDialog()"
                >
                  <TrashIcon class="h-4 w-4" />
                  Löschen
                </button>
              </template>
            </OptionsMenu>
          </div>
          <p class="mt-2 ml-auto text-right text-sm text-gray-500">{{ formatDateOnly(trip.date) }}</p>
        </div>

        <div v-else class="mt-8">
          <h1 class="text-2xl text-gray-900">Reise nicht gefunden</h1>
        </div>

        <TripComments v-if="trip" :tripId="String(route.params.id)" />

        <!-- Delete Confirmation Dialog -->
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click.self="closeDeleteDialog"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 class="text-lg font-semibold text-gray-900">Reise löschen?</h2>
            <p class="mt-2 text-sm text-gray-600">
              Bist du sicher, dass du diese Reise löschen möchtest? Alle zugehörigen Kommentare
              werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                @click="closeDeleteDialog"
                class="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Abbrechen
              </button>
              <button
                @click="confirmDelete"
                :disabled="deleting"
                class="rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed"
                :class="deleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'"
              >
                {{ deleting ? 'Wird gelöscht…' : 'Löschen' }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
