<script setup lang="ts">
import { ref } from 'vue'
import { auth0 } from '@/auth0'
import {
  HomeIcon,
  NewspaperIcon,
  UserCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/solid'
import { useUserRole } from '@/composables/useUserRole'
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
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gray-50/90 px-6 py-4 backdrop-blur-sm"
  >
    <router-link :to="homeRoute()" class="flex items-center gap-2">
      <img :src="logo" alt="Travelmap Logo" class="h-8 w-auto" />
      <span class="text-xl text-gray-900">Travelmap</span>
    </router-link>
    <div v-if="isAuthenticated" class="flex items-center gap-4">
      <!-- Regular user -->
      <template v-if="!isAdmin && !isSupport && !isMarketing">
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
      </template>

      <!-- Admin -->
      <router-link
        v-if="isAdmin"
        :to="{ name: 'admin-users' }"
        class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
        aria-label="Benutzerverwaltung"
        title="Benutzerverwaltung"
      >
        <UsersIcon class="h-6 w-6" />
      </router-link>

      <!-- Support -->
      <router-link
        v-if="isSupport"
        :to="{ name: 'support' }"
        class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
        aria-label="Support – Moderation"
        title="Moderation"
      >
        <ShieldCheckIcon class="h-6 w-6" />
      </router-link>

      <!-- Marketing -->
      <router-link
        v-if="isMarketing"
        :to="{ name: 'marketing' }"
        class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
        aria-label="Marketing – Statistiken"
        title="Statistiken"
      >
        <ChartBarIcon class="h-6 w-6" />
      </router-link>

      <!-- Profile: Dropdown für Admin/Marketing/Support -->
      <div v-if="isAdmin || isSupport || isMarketing" class="relative">
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

        <!-- Overlay zum Schließen bei Klick außerhalb -->
        <div v-if="showProfileMenu" class="fixed inset-0 z-40" @click="showProfileMenu = false" />

        <!-- Dropdown-Menü -->
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

      <!-- Profile: direkter Link für normale User -->
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
  </nav>
</template>
