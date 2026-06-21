<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAdminUsers, type AdminUser } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')

function formatAddress(user: AdminUser): string {
  const parts = [user.street, [user.postalCode, user.city].filter(Boolean).join(' '), user.country].filter(
    (part) => part && part.trim().length > 0,
  )
  return parts.length > 0 ? parts.join(', ') : '–'
}

onMounted(async () => {
  try {
    users.value = await fetchAdminUsers()
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Fehler beim Laden der Benutzer:innen.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <h1 class="mt-8 mb-6 text-2xl font-semibold text-gray-900">Benutzerverwaltung</h1>

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        <div v-else class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">Name</th>
                <th class="px-4 py-3 font-medium">Adresse</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-t border-gray-100">
                <td class="px-4 py-3 text-gray-900">{{ user.displayName }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatAddress(user) }}</td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="2" class="px-4 py-6 text-center text-gray-500">Keine Benutzer:innen vorhanden.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
