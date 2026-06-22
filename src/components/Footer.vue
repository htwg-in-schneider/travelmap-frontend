<script setup lang="ts">
import { ref } from 'vue'
import ContactForm from '@/components/ContactForm.vue'

const showContact = ref(false)
</script>

<template>
  <footer class="mt-8 border-t border-gray-200 py-6">
    <div class="flex flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
      <p>&copy; {{ new Date().getFullYear() }} Travelmap</p>
      <div class="flex flex-wrap justify-center gap-4">
        <router-link :to="{ name: 'impressum' }" class="transition-colors hover:text-gray-900">
          Impressum
        </router-link>
        <router-link :to="{ name: 'datenschutz' }" class="transition-colors hover:text-gray-900">
          Datenschutz
        </router-link>
        <button
          type="button"
          class="transition-colors hover:text-gray-900"
          @click="showContact = !showContact"
        >
          Kontakt
        </button>
      </div>
    </div>

    <div v-if="showContact" class="mx-auto mt-6 max-w-lg">
      <ContactForm />
    </div>
  </footer>
</template>
