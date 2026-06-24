<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/vue/24/solid'
import {
  fetchSupportTrips,
  deleteSupportTrip,
  deleteSupportComment,
  fetchSupportUsers,
  fetchCommentsByTrip,
  ApiError,
  type AdminUser,
} from '@/services/api'
import { type Trip, type Comment } from '@/data'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { useRouter } from 'vue-router'

type Tab = 'trips' | 'users'

const router = useRouter()
const activeTab = ref<Tab>('trips')

// --- Trips tab ---
const trips = ref<Trip[]>([])
const tripsLoading = ref(true)
const tripsError = ref('')
const tripSearchTerm = ref('')
const deletingTripId = ref<number | null>(null)
const tripMsg = ref('')
const tripErr = ref('')

// Comments expandable per trip
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
    setTimeout(() => { tripMsg.value = '' }, 3000)
  } catch (err) {
    tripErr.value = err instanceof ApiError && err.status === 403 ? 'Keine Berechtigung.' : 'Fehler beim Löschen.'
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
      commentsMap.value[trip.id] = await fetchCommentsByTrip(trip.id)
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
    setTimeout(() => { tripMsg.value = '' }, 3000)
  } catch (err) {
    tripErr.value = err instanceof ApiError && err.status === 403 ? 'Keine Berechtigung.' : 'Fehler beim Löschen.'
  } finally {
    deletingCommentId.value = null
  }
}

// --- Users tab ---
const users = ref<AdminUser[]>([])
const usersLoading = ref(false)
const usersError = ref('')
const userSearchTerm = ref('')
const usersLoaded = ref(false)

const filteredUsers = computed(() => {
  const term = userSearchTerm.value.trim().toLowerCase()
  if (!term) return users.value
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(term) ||
      u.displayName.toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term) ||
      (u.city ?? '').toLowerCase().includes(term) ||
      (u.country ?? '').toLowerCase().includes(term),
  )
})

function formatAddress(u: AdminUser): string {
  const parts = [u.street, [u.postalCode, u.city].filter(Boolean).join(' '), u.country].filter(
    (p) => p && p.trim().length > 0,
  )
  return parts.length > 0 ? parts.join(', ') : '–'
}

async function switchToUsers() {
  activeTab.value = 'users'
  if (!usersLoaded.value) {
    usersLoading.value = true
    try {
      users.value = await fetchSupportUsers()
      usersLoaded.value = true
    } catch {
      usersError.value = 'Fehler beim Laden der User.'
    } finally {
      usersLoading.value = false
    }
  }
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'admin': return 'bg-blue-100 text-blue-700'
    case 'support': return 'bg-amber-100 text-amber-700'
    case 'marketing': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}
function roleLabel(role: string): string {
  const map: Record<string, string> = { admin: 'Admin', support: 'Support', marketing: 'Marketing', user: 'User' }
  return map[role] ?? role
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="mt-8 mb-6 flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-gray-900">Moderation</h1>
          <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Support</span>
        </div>

        <!-- Tabs -->
        <div class="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
          <button
            :class="['rounded-lg px-4 py-1.5 text-sm font-medium transition', activeTab === 'trips' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100']"
            @click="activeTab = 'trips'"
          >
            Trips
          </button>
          <button
            :class="['rounded-lg px-4 py-1.5 text-sm font-medium transition', activeTab === 'users' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100']"
            @click="switchToUsers"
          >
            User
          </button>
        </div>

        <!-- ── TRIPS TAB ── -->
        <template v-if="activeTab === 'trips'">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex flex-1 items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 mr-4">
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

          <div v-else-if="filteredTrips.length === 0" class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Keine Trips gefunden.
          </div>

          <div v-else class="flex flex-col gap-2">
            <template v-for="trip in filteredTrips" :key="trip.id">
              <!-- Trip row -->
              <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div class="flex items-center gap-3 px-4 py-3">
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ trip.title }}</div>
                    <div class="text-xs text-gray-500">@{{ trip.authorUsername ?? '–' }} · {{ trip.countryCode ?? '–' }} · {{ trip.date }}</div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                      @click="toggleComments(trip)"
                      :title="expandedTripId === trip.id ? 'Kommentare ausblenden' : 'Kommentare anzeigen'"
                    >
                      <ChatBubbleLeftIcon class="h-4 w-4" />
                      <span class="hidden sm:inline">{{ trip.commentCount }}</span>
                      <ChevronUpIcon v-if="expandedTripId === trip.id" class="h-3 w-3" />
                      <ChevronDownIcon v-else class="h-3 w-3" />
                    </button>
                    <button
                      class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                      @click="router.push({ name: 'trip-detail', params: { id: trip.id } })"
                    >
                      <EyeIcon class="h-4 w-4" />
                      <span class="hidden sm:inline">Ansehen</span>
                    </button>
                    <button
                      class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      :disabled="deletingTripId === trip.id"
                      @click="removeTrip(trip)"
                    >
                      <TrashIcon class="h-4 w-4" />
                      <span class="hidden sm:inline">{{ deletingTripId === trip.id ? 'Löschen…' : 'Löschen' }}</span>
                    </button>
                  </div>
                </div>

                <!-- Comments panel -->
                <div v-if="expandedTripId === trip.id" class="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div v-if="commentsLoading && !commentsMap[trip.id]" class="text-sm text-gray-400">Kommentare laden…</div>
                  <div v-else-if="!commentsMap[trip.id] || commentsMap[trip.id].length === 0" class="text-sm text-gray-400">Keine Kommentare.</div>
                  <div v-else class="flex flex-col gap-2">
                    <div
                      v-for="comment in commentsMap[trip.id]"
                      :key="comment.id"
                      class="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                    >
                      <div class="min-w-0">
                        <span class="font-medium text-gray-700">@{{ comment.authorUsername ?? '?' }}</span>
                        <span class="ml-2 text-gray-600">{{ comment.text }}</span>
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
        </template>

        <!-- ── USERS TAB ── -->
        <template v-else>
          <div class="mb-4 flex items-center gap-3">
            <div class="flex flex-1 items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              <input
                v-model="userSearchTerm"
                type="text"
                placeholder="Suchen nach Name, E-Mail, Ort oder Land"
                class="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <span class="shrink-0 text-sm text-gray-500">{{ filteredUsers.length }} User</span>
          </div>

          <div v-if="usersError" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{{ usersError }}</div>
          <div v-if="usersLoading" class="text-gray-500">Laden…</div>

          <div v-else-if="filteredUsers.length === 0" class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Keine User gefunden.
          </div>

          <div v-else>
            <!-- Desktop table -->
            <div class="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">Name</th>
                    <th class="px-4 py-3 font-medium">Adresse</th>
                    <th class="px-4 py-3 font-medium">Bio</th>
                    <th class="px-4 py-3 font-medium">Rolle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id" class="border-t border-gray-100">
                    <td class="px-4 py-3 text-gray-900">
                      <div class="font-medium">{{ user.displayName }}</div>
                      <div class="text-xs text-gray-500">@{{ user.username }}</div>
                      <div v-if="user.email" class="text-xs text-gray-500">{{ user.email }}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 text-sm">{{ formatAddress(user) }}</td>
                    <td class="px-4 py-3 text-gray-500 text-sm max-w-xs truncate">{{ user.bio || '–' }}</td>
                    <td class="px-4 py-3">
                      <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeClass(user.role ?? 'user')]">
                        {{ roleLabel(user.role ?? 'user') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="flex flex-col gap-4 md:hidden">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div class="mb-1 flex items-start justify-between">
                  <div>
                    <div class="font-medium text-gray-900">{{ user.displayName }}</div>
                    <div class="text-xs text-gray-500">@{{ user.username }}</div>
                    <div v-if="user.email" class="text-xs text-gray-500">{{ user.email }}</div>
                  </div>
                  <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeClass(user.role ?? 'user')]">
                    {{ roleLabel(user.role ?? 'user') }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">{{ formatAddress(user) }}</div>
                <div v-if="user.bio" class="mt-1 text-xs text-gray-500">{{ user.bio }}</div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <Footer />
    </div>
  </div>
</template>
