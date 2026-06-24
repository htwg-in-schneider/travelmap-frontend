<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/solid'
import {
  fetchSupportTrips,
  deleteSupportTrip,
  deleteSupportComment,
  fetchCommentsByTrip,
  ApiError,
} from '@/services/api'
import { type Trip, type Comment } from '@/data'
import { useRouter } from 'vue-router'
import OptionsMenu from '@/components/OptionsMenu.vue'
import { formatDateOnly, formatDateTime } from '@/utils/date'

const router = useRouter()

const trips = ref<Trip[]>([])
const tripsLoading = ref(true)
const tripsError = ref('')
const tripSearchTerm = ref('')
const deletingTripId = ref<number | null>(null)
const tripMsg = ref('')
const tripErr = ref('')
const expandedTripId = ref<number | null>(null)
const commentsMap = ref<Record<number, Comment[]>>({})
const commentsLoading = ref(false)
const deletingCommentId = ref<number | null>(null)

const filteredTrips = computed(() => {
  const term = tripSearchTerm.value.trim().toLowerCase()
  if (!term) return trips.value
  return trips.value.filter(
    (t) =>
      t.title.toLowerCase().includes(term) ||
      (t.authorUsername ?? '').toLowerCase().includes(term) ||
      (t.countryCode ?? '').toLowerCase().includes(term),
  )
})

onMounted(async () => {
  try {
    trips.value = await fetchSupportTrips()
  } catch {
    tripsError.value = 'Fehler beim Laden der Trips.'
  } finally {
    tripsLoading.value = false
  }
})

async function removeTrip(trip: Trip) {
  if (!confirm(`Soll der Trip „${trip.title}" von @${trip.authorUsername ?? '?'} wirklich gelöscht werden?`)) return
  deletingTripId.value = trip.id
  tripErr.value = ''
  try {
    await deleteSupportTrip(trip.id)
    trips.value = trips.value.filter((t) => t.id !== trip.id)
    if (expandedTripId.value === trip.id) expandedTripId.value = null
    tripMsg.value = 'Trip gelöscht.'
    setTimeout(() => {
      tripMsg.value = ''
    }, 3000)
  } catch (err) {
    tripErr.value =
      err instanceof ApiError && err.status === 403 ? 'Keine Berechtigung.' : 'Fehler beim Löschen.'
  } finally {
    deletingTripId.value = null
  }
}

async function toggleComments(trip: Trip) {
  if (expandedTripId.value === trip.id) {
    expandedTripId.value = null
    return
  }
  expandedTripId.value = trip.id
  if (!commentsMap.value[trip.id]) {
    commentsLoading.value = true
    try {
      commentsMap.value[trip.id] = await fetchCommentsByTrip(String(trip.id))
    } catch {
      commentsMap.value[trip.id] = []
    } finally {
      commentsLoading.value = false
    }
  }
}

async function removeComment(tripId: number, comment: Comment) {
  deletingCommentId.value = comment.id
  tripErr.value = ''
  try {
    await deleteSupportComment(comment.id)
    commentsMap.value[tripId] = (commentsMap.value[tripId] ?? []).filter((c) => c.id !== comment.id)
    trips.value = trips.value.map((t) =>
      t.id === tripId ? { ...t, commentCount: Math.max(0, t.commentCount - 1) } : t,
    )
    tripMsg.value = 'Kommentar gelöscht.'
    setTimeout(() => {
      tripMsg.value = ''
    }, 3000)
  } catch (err) {
    tripErr.value =
      err instanceof ApiError && err.status === 403 ? 'Keine Berechtigung.' : 'Fehler beim Löschen.'
  } finally {
    deletingCommentId.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between gap-4">
      <div
        class="mr-4 flex flex-1 items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3"
      >
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        <input
          v-model="tripSearchTerm"
          type="text"
          placeholder="Suchen nach Trip, Username oder Ländercode"
          class="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
      <span class="shrink-0 text-sm text-gray-500">{{ filteredTrips.length }} Trips</span>
    </div>

    <div v-if="tripMsg" class="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{{ tripMsg }}</div>
    <div v-if="tripErr" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{{ tripErr }}</div>
    <div v-if="tripsError" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{{ tripsError }}</div>
    <div v-if="tripsLoading" class="text-gray-500">Laden…</div>

    <div
      v-else-if="filteredTrips.length === 0"
      class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500"
    >
      Keine Trips gefunden.
    </div>

    <div v-else class="flex flex-col gap-2">
      <template v-for="trip in filteredTrips" :key="trip.id">
        <div class="rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium text-gray-900">{{ trip.title }}</div>
              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>@{{ trip.authorUsername ?? '–' }}</span>
                <span>{{ trip.countryCode ?? '–' }}</span>
                <span>Reisedatum: {{ formatDateOnly(trip.date) }}</span>
                <span>Erstellt: {{ formatDateTime(trip.createdAt) }}</span>
                <span v-if="trip.publicTrip === false" class="inline-flex items-center gap-1">
                  <LockClosedIcon class="h-3.5 w-3.5" />
                  Privat
                </span>
              </div>
            </div>
            <div class="hidden items-center gap-3 text-xs text-gray-500 sm:flex">
              <span class="inline-flex items-center gap-1">
                <HeartIcon class="h-3.5 w-3.5" />
                {{ trip.likeCount }}
              </span>
              <span>{{ trip.commentCount }} Kommentare</span>
            </div>
            <OptionsMenu label="Tripoptionen">
              <template #default="{ close }">
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                  role="menuitem"
                  @click="close(); toggleComments(trip)"
                >
                  <ChatBubbleLeftIcon class="h-4 w-4" />
                  {{ expandedTripId === trip.id ? 'Kommentare ausblenden' : 'Kommentare anzeigen' }}
                  <span class="ml-auto text-xs text-gray-500">{{ trip.commentCount }}</span>
                  <ChevronUpIcon v-if="expandedTripId === trip.id" class="h-3 w-3" />
                  <ChevronDownIcon v-else class="h-3 w-3" />
                </button>
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                  role="menuitem"
                  @click="close(); router.push({ name: 'trip-detail', params: { id: trip.id } })"
                >
                  <EyeIcon class="h-4 w-4" />
                  Ansehen
                </button>
                <button
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  role="menuitem"
                  :disabled="deletingTripId === trip.id"
                  @click="close(); removeTrip(trip)"
                >
                  <TrashIcon class="h-4 w-4" />
                  {{ deletingTripId === trip.id ? 'Löschen…' : 'Löschen' }}
                </button>
              </template>
            </OptionsMenu>
          </div>

          <div v-if="expandedTripId === trip.id" class="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <div v-if="commentsLoading && !commentsMap[trip.id]" class="text-sm text-gray-400">Kommentare laden…</div>
            <div v-else-if="(commentsMap[trip.id]?.length ?? 0) === 0" class="text-sm text-gray-400">Keine Kommentare.</div>
            <div v-else class="flex flex-col gap-2">
              <div
                v-for="comment in commentsMap[trip.id] ?? []"
                :key="comment.id"
                class="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span class="font-medium text-gray-700">@{{ comment.authorUsername ?? '?' }}</span>
                    <span>{{ formatDateTime(comment.createdAt) }}</span>
                  </div>
                  <div class="mt-1 text-gray-600">{{ comment.text }}</div>
                </div>
                <button
                  class="shrink-0 rounded-lg px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  :disabled="deletingCommentId === comment.id"
                  @click="removeComment(trip.id, comment)"
                  title="Kommentar löschen"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
