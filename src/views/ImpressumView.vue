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
          <h1 class="text-2xl font-semibold text-gray-900">Impressum</h1>
        </div>

        <div class="flex flex-col gap-4 text-sm text-gray-700">
          <p>Angaben gemäß § 5 TMG (Platzhalter für dieses Lehrveranstaltungsprojekt):</p>

          <p>
            Travelmap<br />
            c/o HTWG Konstanz<br />
            Alfred-Wachtel-Straße 8<br />
            78462 Konstanz<br />
            Deutschland
          </p>

          <p>
            Kontakt:<br />
            E-Mail: <a class="text-blue-600 hover:underline" href="mailto:kontakt@travelmap.app">kontakt@travelmap.app</a>
          </p>

          <p>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
            Travelmap-Team
          </p>

          <p class="text-gray-500">
            Travelmap ist ein im Rahmen der Lehrveranstaltung „Web-Technologien" entstandenes
            Studienprojekt und kein kommerzielles Angebot.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
