<script setup lang="ts">
import { ref, computed } from 'vue'

const CONTACT_EMAIL = 'kontakt@travelmap.app'

const name = ref('')
const email = ref('')
const message = ref('')

const canSend = computed(
  () => name.value.trim().length > 0 && email.value.trim().length > 0 && message.value.trim().length > 0,
)

function send() {
  if (!canSend.value) return

  const subject = `Kontaktanfrage von ${name.value.trim()}`
  const body = `${message.value.trim()}\n\n---\nVon: ${name.value.trim()} (${email.value.trim()})`
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  window.location.href = mailto
}
</script>

<template>
  <section>
    <p class="mb-6 text-sm text-gray-600">
      Fragen, Feedback oder Probleme? Schreib uns - die Nachricht öffnet sich in deinem
      E-Mail-Programm.
    </p>

    <form class="flex flex-col gap-4 sm:max-w-lg" @submit.prevent="send">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700" for="contact-name">Name</label>
        <input
          id="contact-name"
          v-model="name"
          type="text"
          required
          class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700" for="contact-email">E-Mail</label>
        <input
          id="contact-email"
          v-model="email"
          type="email"
          required
          class="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700" for="contact-message">Nachricht</label>
        <textarea
          id="contact-message"
          v-model="message"
          rows="4"
          required
          class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
        />
      </div>

      <button
        type="submit"
        :disabled="!canSend"
        class="w-full rounded-xl px-6 py-3 text-base font-medium text-white transition-colors disabled:cursor-not-allowed sm:w-auto"
        :class="canSend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-400'"
      >
        Nachricht senden
      </button>
    </form>
  </section>
</template>
