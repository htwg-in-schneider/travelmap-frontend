<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import AdminUsersPanel from '@/components/AdminUsersPanel.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-semibold text-gray-900">Benutzerverwaltung</h1>
        </div>

        <AdminUsersPanel />
      </main>

      <Footer />
    </div>
  </div>
</template>
