<script setup lang="ts">
import { ref } from 'vue'
import { auth0 } from '@/auth0'
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/vue/24/solid'
import { useUserRole } from '@/composables/useUserRole'
import logo from '../../assets/travelmap-logo.svg'

const { isAuthenticated, isLoading, user } = auth0
const { isAdmin } = useUserRole()

const menuOpen = ref(false)

function login() {
  auth0.loginWithRedirect()
}

function signOut() {
  menuOpen.value = false
  auth0.logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gray-50/90 px-6 py-4 backdrop-blur-sm"
  >
    <router-link :to="{ name: 'home' }" class="flex items-center gap-2">
      <img :src="logo" alt="Travelmap Logo" class="h-8 w-auto" />
      <span class="text-xl text-gray-900">Travelmap</span>
    </router-link>
    <div class="flex items-center gap-4">
      <MagnifyingGlassIcon class="h-7 w-7 text-gray-800" />

      <button
        v-if="!isLoading && !isAuthenticated"
        @click="login"
        class="rounded-xl bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Anmelden
      </button>

      <div v-else-if="isAuthenticated" class="relative">
        <button
          @click="menuOpen = !menuOpen"
          class="flex items-center gap-1.5"
          aria-label="Benutzermenü"
        >
          <img
            v-if="user?.picture"
            :src="user.picture"
            :alt="user?.name ?? 'Profilbild'"
            class="h-8 w-8 rounded-full"
          />
          <UserCircleIcon v-else class="h-8 w-8 text-gray-800" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
          @click.self="menuOpen = false"
        >
          <div class="px-2 py-1.5 text-sm text-gray-900">
            {{ user?.name }}
            <span
              v-if="isAdmin"
              class="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              Admin
            </span>
          </div>
          <button
            @click="signOut"
            class="w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
