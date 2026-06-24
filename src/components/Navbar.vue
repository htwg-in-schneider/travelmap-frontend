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

const { isAuthenticated } = auth0
const { isAdmin, isSupport, isMarketing, username } = useUserRole()
const showProfileMenu = ref(false)

function homeRoute() {
  if (isAdmin.value) return { name: 'admin-dashboard' }
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
const currentRouteName = computed(() => route.name?.toString() ?? '')
const iconClass = 'h-5 w-5 min-[380px]:h-6 min-[380px]:w-6'

function navItemClass(active = false) {
  return [
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none min-[380px]:h-9 min-[380px]:w-9',
    active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-200',
  ]
}

function isRouteActive(routeName: string) {
  return currentRouteName.value === routeName
}

function isProfileRouteActive() {
  if (currentRouteName.value === 'profile') return true
  return currentRouteName.value === 'profile-username' && route.params.username === username.value
}

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
    class="fixed top-0 right-0 left-0 z-50 bg-gray-50/90 px-2 py-3 backdrop-blur-sm min-[380px]:px-4 sm:px-6 sm:py-4"
  >
    <div class="mx-auto flex w-full max-w-6xl items-center gap-2 min-[380px]:gap-3">
      <router-link :to="homeRoute()" class="flex min-w-0 shrink items-center gap-2">
        <img :src="logo" alt="Travelmap Logo" class="h-7 w-auto shrink-0 sm:h-8" />
        <span class="hidden truncate text-lg text-gray-900 min-[380px]:inline sm:text-xl">Travelmap</span>
      </router-link>

      <div v-if="isAuthenticated" class="ml-auto flex min-w-0 shrink-0 items-center gap-1 min-[380px]:gap-2 sm:gap-4">
        <template v-if="!isStaff">
          <router-link
            :to="{ name: 'home' }"
            :class="navItemClass(isRouteActive('home'))"
            aria-label="Meine Reisen"
            title="Meine Reisen"
          >
            <HomeIcon :class="iconClass" />
          </router-link>
          <router-link
            :to="{ name: 'feed' }"
            :class="navItemClass(isRouteActive('feed'))"
            aria-label="Feed"
            title="Feed"
          >
            <NewspaperIcon :class="iconClass" />
          </router-link>
          <div ref="searchRoot" class="relative">
            <button
              :class="navItemClass(searchExpanded)"
              aria-label="User suchen"
              title="User suchen"
              :aria-pressed="searchExpanded"
              @click="toggleSearch"
            >
              <MagnifyingGlassIcon :class="iconClass" />
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
          :to="{ name: 'admin-dashboard' }"
          :class="navItemClass(isRouteActive('admin-dashboard'))"
          aria-label="Admin-Zentrale"
          title="Admin-Zentrale"
        >
          <UsersIcon :class="iconClass" />
        </router-link>
        <router-link
          v-if="isSupport"
          :to="{ name: 'support' }"
          :class="navItemClass(isRouteActive('support'))"
          aria-label="Support – Moderation"
          title="Moderation"
        >
          <ShieldCheckIcon :class="iconClass" />
        </router-link>
        <router-link
          v-if="isMarketing"
          :to="{ name: 'marketing' }"
          :class="navItemClass(isRouteActive('marketing'))"
          aria-label="Marketing – Statistiken"
          title="Statistiken"
        >
          <ChartBarIcon :class="iconClass" />
        </router-link>

        <div v-if="isStaff" class="relative">
          <button
            :class="navItemClass(isProfileRouteActive())"
            aria-label="Mein Profil"
            title="Mein Profil"
            @click="showProfileMenu = !showProfileMenu"
          >
            <UserCircleIcon :class="iconClass" />
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
          :class="navItemClass(isProfileRouteActive())"
          aria-label="Mein Profil"
          title="Mein Profil"
        >
          <UserCircleIcon :class="iconClass" />
        </router-link>
      </div>
    </div>
  </nav>
</template>
