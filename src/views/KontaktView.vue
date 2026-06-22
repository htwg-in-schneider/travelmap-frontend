<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ContactForm from '@/components/ContactForm.vue'

const router = useRouter()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="relative z-10 mb-8 flex items-center gap-4">
          <button
            @click="router.back()"
            class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeftIcon class="h-5 w-5" />
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Kontakt</h1>
        </div>

        <ContactForm />
      </main>

      <Footer />
    </div>
  </div>
</template>
