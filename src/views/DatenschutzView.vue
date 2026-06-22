<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

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
          <h1 class="text-2xl font-semibold text-gray-900">Datenschutzerklärung</h1>
        </div>

        <div class="flex flex-col gap-4 text-sm text-gray-700">
          <p class="text-gray-500">
            Platzhalter-Datenschutzerklärung für dieses Lehrveranstaltungsprojekt.
          </p>

          <h2 class="text-base font-semibold text-gray-900">Verantwortliche Stelle</h2>
          <p>Travelmap-Team, siehe <router-link class="text-blue-600 hover:underline" :to="{ name: 'impressum' }">Impressum</router-link>.</p>

          <h2 class="text-base font-semibold text-gray-900">Anmeldung über Auth0</h2>
          <p>
            Für die Anmeldung nutzen wir den Dienst Auth0 (Okta, Inc.). Beim Login werden
            E-Mail-Adresse und Name verarbeitet, um deinen Account dieser Anwendung zuzuordnen
            und deine Reisen und Kommentare einem Profil zuzuweisen.
          </p>

          <h2 class="text-base font-semibold text-gray-900">Von dir eingegebene Daten</h2>
          <p>
            Reisen, Kommentare und die Profildaten (Name, Adresse), die du über die Anwendung
            anlegst, werden in unserer Datenbank gespeichert, bis du sie löschst bzw. dein
            Account-Inhaber sie löscht.
          </p>

          <h2 class="text-base font-semibold text-gray-900">Kontaktformular</h2>
          <p>
            Das Kontaktformular auf der <router-link class="text-blue-600 hover:underline" :to="{ name: 'kontakt' }">Kontakt-Seite</router-link>
            öffnet lediglich dein eigenes E-Mail-Programm (mailto-Link) - die Eingaben werden
            nicht an unseren Server übertragen oder gespeichert.
          </p>

          <h2 class="text-base font-semibold text-gray-900">Deine Rechte</h2>
          <p>
            Du kannst jederzeit Auskunft, Berichtigung oder Löschung deiner Daten verlangen.
            Kontaktiere uns dazu über die im <router-link class="text-blue-600 hover:underline" :to="{ name: 'impressum' }">Impressum</router-link> genannte E-Mail-Adresse.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
