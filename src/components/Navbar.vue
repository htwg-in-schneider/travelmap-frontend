<script setup lang="ts">
import { auth0 } from '@/auth0'
import {
  HomeIcon,
  NewspaperIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import { useUserRole } from '@/composables/useUserRole'
import logo from '../../assets/travelmap-logo.svg'

const { isAuthenticated, user } = auth0
const { isAdmin, username } = useUserRole()
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gray-50/90 px-6 py-4 backdrop-blur-sm"
  >
    <router-link
      :to="isAdmin ? { name: 'admin-users' } : { name: 'home' }"
      class="flex items-center gap-2"
    >
      <img :src="logo" alt="Travelmap Logo" class="h-8 w-auto" />
      <span class="text-xl text-gray-900">Travelmap</span>
    </router-link>
    <div v-if="isAuthenticated" class="flex items-center gap-4">
      <template v-if="!isAdmin">
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
      <router-link
        v-else
        :to="{ name: 'admin-users' }"
        class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-200"
        aria-label="Benutzerverwaltung"
        title="Benutzerverwaltung"
      >
        <UsersIcon class="h-6 w-6" />
      </router-link>
      <router-link
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
