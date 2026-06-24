<script setup lang="ts">
import { auth0 } from '@/auth0'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  UserCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/solid'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserRole } from '@/composables/useUserRole'
import type { UserSummary } from '@/data'
import { searchUsers } from '@/services/api'
import logo from '../../assets/travelmap-logo.svg'

const { isAuthenticated, user } = auth0
const { isAdmin, isSupport, isMarketing, username } = useUserRole()
const showProfileMenu = ref(false)

function homeRoute() {
  if (isAdmin.value) return { name: 'admin-users' }
  if (isSupport.value) return { name: 'support' }
  if (isMarketing.value) return { name: 'marketing' }
  return { name: 'home' }
}

function signOut() {
  auth0.logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}

const router = useRouter()
const route = useRoute()

const searchRoot = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const query = ref('')
const results = ref<UserSummary[]>([])
const loading = ref(false)
const error = ref('')
const open = ref(false)
const searchExpanded = ref(false)

const debounceMs = 250

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let activeRequestId = 0

const trimmedQuery = computed(() => query.value.trim())
const isStaff = computed(() => isAdmin.value || isSupport.value || isMarketing.value)

watch(trimmedQuery, (nextQuery) => {
  if (!searchExpanded.value) return
  queueSearch(nextQuery)
})

watch(
  () => route.fullPath,
  () => {
    resetSearch()
    showProfileMenu.value = false
  },
)

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown)
})

onUnmounted(() => {
  clearPendingSearch()
  document.removeEventListener('mousedown', onDocumentPointerDown)
})

function clearPendingSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

function queueSearch(searchTerm: string) {
  clearPendingSearch()
  open.value = true
  loading.value = true
  error.value = ''
  const requestId = ++activeRequestId

  debounceTimer = setTimeout(() => {
    runSearch(searchTerm, requestId)
  }, debounceMs)
}

async function runSearch(searchTerm: string, requestId = ++activeRequestId) {
  if (requestId !== activeRequestId) return

  open.value = true
  loading.value = true
  error.value = ''

  try {
    const users = await searchUsers(searchTerm)
    if (requestId !== activeRequestId) return
    results.value = users
    error.value = ''
    open.value = true
  } catch (err) {
    if (requestId !== activeRequestId) return
    console.error('Error searching users:', err)
    results.value = []
    error.value = 'Benutzersuche fehlgeschlagen.'
    open.value = true
  } finally {
    if (requestId === activeRequestId) {
      loading.value = false
    }
  }
}

function clearSearchState() {
  clearPendingSearch()
  activeRequestId++
  results.value = []
  loading.value = false
  error.value = ''
  open.value = false
}

function resetSearch() {
  clearSearchState()
  query.value = ''
  searchExpanded.value = false
}

function onFocus() {
  if (results.value.length || loading.value || error.value || searchExpanded.value) {
    open.value = true
  }
}

function onEscape() {
  resetSearch()
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!searchRoot.value) return
  const target = event.target
  if (target instanceof Node && !searchRoot.value.contains(target)) {
    resetSearch()
  }
}

async function toggleSearch() {
  searchExpanded.value = !searchExpanded.value

  if (!searchExpanded.value) {
    resetSearch()
    return
  }

  open.value = true
  await new Promise((resolve) => requestAnimationFrame(resolve))
  searchInput.value?.focus()
  await runSearch(trimmedQuery.value)
}

async function goToProfile(userSummary: UserSummary) {
  resetSearch()
  await router.push({ name: 'profile-username', params: { username: userSummary.username } })
}
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 bg-gray-50/90 px-4 py-4 backdrop-blur-sm sm:px-6"
  >
    <div class="mx-auto flex w-full max-w-6xl items-center gap-3">
      <router-link :to="homeRoute()" class="flex shrink-0 items-center gap-2">
        <img :src="logo" alt="Travelmap Logo" class="h-8 w-auto" />
        <span class="text-xl text-gray-900">Travelmap</span>
      </router-link>

      <div v-if="isAuthenticated" class="ml-auto flex shrink-0 items-center gap-4">
        <template v-if="!isStaff">
          <router-link
            :to="{ name: 'home' }"
            class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
            aria-label="Meine Reisen"
            title="Meine Reisen"
          >
            <HomeIcon class="h-6 w-6" />
          </router-link>
          <router-link
            :to="{ name: 'feed' }"
            class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
            aria-label="Feed"
            title="Feed"
          >
            <NewspaperIcon class="h-6 w-6" />
          </router-link>
          <div ref="searchRoot" class="relative">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
              aria-label="User suchen"
              title="User suchen"
              @click="toggleSearch"
            >
              <MagnifyingGlassIcon class="h-6 w-6" />
            </button>

            <div
              v-if="searchExpanded"
              class="absolute top-[calc(100%+0.5rem)] right-0 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
            >
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref="searchInput"
                  v-model="query"
                  type="text"
                  placeholder="User suchen…"
                  class="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-600"
                  aria-label="User suchen"
                  @focus="onFocus"
                  @keydown.esc.prevent="onEscape"
                />
              </div>

              <div
                v-if="open"
                class="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div v-if="loading" class="px-4 py-3 text-sm text-gray-500">Suche...</div>
                <div v-else-if="error" class="px-4 py-3 text-sm text-red-500">{{ error }}</div>
                <div v-else-if="results.length === 0" class="px-4 py-3 text-sm text-gray-500">
                  Keine Nutzer gefunden.
                </div>
                <ul v-else class="max-h-80 overflow-y-auto py-2">
                  <li v-for="result in results" :key="result.id">
                    <button
                      class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                      @click="goToProfile(result)"
                    >
                      <img
                        v-if="result.avatarUrl"
                        :src="result.avatarUrl"
                        :alt="result.displayName || result.username"
                        class="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <div
                        v-else
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100"
                      >
                        <UserCircleIcon class="h-7 w-7 text-gray-500" />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900">
                          {{ result.displayName || result.username }}
                        </p>
                        <p class="truncate text-xs text-gray-500">@{{ result.username }}</p>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>

        <router-link
          v-if="isAdmin"
          :to="{ name: 'admin-users' }"
          class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
          aria-label="Benutzerverwaltung"
          title="Benutzerverwaltung"
        >
          <UsersIcon class="h-6 w-6" />
        </router-link>
        <router-link
          v-if="isSupport"
          :to="{ name: 'support' }"
          class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
          aria-label="Support – Moderation"
          title="Moderation"
        >
          <ShieldCheckIcon class="h-6 w-6" />
        </router-link>
        <router-link
          v-if="isMarketing"
          :to="{ name: 'marketing' }"
          class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
          aria-label="Marketing – Statistiken"
          title="Statistiken"
        >
          <ChartBarIcon class="h-6 w-6" />
        </router-link>

        <div v-if="isStaff" class="relative">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
            aria-label="Mein Profil"
            title="Mein Profil"
            @click="showProfileMenu = !showProfileMenu"
          >
            <img
              v-if="user?.picture"
              :src="user.picture"
              :alt="user?.name ?? 'Profilbild'"
              class="h-8 w-8 rounded-full"
            />
            <UserCircleIcon v-else class="h-7 w-7 text-gray-800" />
          </button>

          <div v-if="showProfileMenu" class="fixed inset-0 z-40" @click="showProfileMenu = false" />

          <div
            v-if="showProfileMenu"
            class="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            <router-link
              :to="{ name: 'profile' }"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              @click="showProfileMenu = false"
            >
              <PencilIcon class="h-4 w-4" />
              Profil bearbeiten
            </router-link>
            <button
              class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
              @click="signOut"
            >
              <ArrowRightOnRectangleIcon class="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>

        <router-link
          v-else
          :to="username ? { name: 'profile-username', params: { username } } : { name: 'profile' }"
          class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
          aria-label="Mein Profil"
          title="Mein Profil"
        >
          <img
            v-if="user?.picture"
            :src="user.picture"
            :alt="user?.name ?? 'Profilbild'"
            class="h-8 w-8 rounded-full"
          />
          <UserCircleIcon v-else class="h-7 w-7 text-gray-800" />
        </router-link>
      </div>
    </div>
  </nav>
</template>
