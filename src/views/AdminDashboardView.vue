<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import AdminModerationPanel from '@/components/AdminModerationPanel.vue'
import AdminUsersPanel from '@/components/AdminUsersPanel.vue'

type AdminTab = 'moderation' | 'users'

const route = useRoute()
const router = useRouter()

const activeTab = computed<AdminTab>(() =>
  route.query.tab === 'users' ? 'users' : 'moderation',
)

function setTab(tab: AdminTab) {
  router.replace({
    name: 'admin-dashboard',
    query: tab === 'users' ? { tab: 'users' } : {},
  })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="mt-8 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Admin-Zentrale</h1>
            <p class="mt-1 text-sm text-gray-500">
              Moderation und Benutzerverwaltung in einer zentralen Ansicht.
            </p>
          </div>
        </div>

        <div class="mb-6 flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            :class="[
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              activeTab === 'moderation' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="setTab('moderation')"
          >
            Moderation
          </button>
          <button
            :class="[
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              activeTab === 'users' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="setTab('users')"
          >
            Benutzerverwaltung
          </button>
        </div>

        <section v-if="activeTab === 'moderation'">
          <AdminModerationPanel />
        </section>

        <section v-else>
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Benutzerverwaltung</h2>
          </div>
          <AdminUsersPanel />
        </section>
      </main>

      <Footer />
    </div>
  </div>
</template>
