<script setup lang="ts">
import { computed, ref } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { fetchSupportUsers, type AdminUser } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import AdminModerationPanel from '@/components/AdminModerationPanel.vue'

type Tab = 'trips' | 'users'

const activeTab = ref<Tab>('trips')
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
  const map: Record<string, string> = {
    admin: 'Admin',
    support: 'Support',
    marketing: 'Marketing',
    user: 'User',
  }
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

        <div class="mb-6 flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            :class="[
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              activeTab === 'trips' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="activeTab = 'trips'"
          >
            Trips
          </button>
          <button
            :class="[
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              activeTab === 'users' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="switchToUsers"
          >
            User
          </button>
        </div>

        <template v-if="activeTab === 'trips'">
          <AdminModerationPanel />
        </template>

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

          <div
            v-else-if="filteredUsers.length === 0"
            class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500"
          >
            Keine User gefunden.
          </div>

          <div v-else>
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
                    <td class="px-4 py-3 text-sm text-gray-600">{{ formatAddress(user) }}</td>
                    <td class="max-w-xs truncate px-4 py-3 text-sm text-gray-500">{{ user.bio || '–' }}</td>
                    <td class="px-4 py-3">
                      <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeClass(user.role ?? 'user')]">
                        {{ roleLabel(user.role ?? 'user') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

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
