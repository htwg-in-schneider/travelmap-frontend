<script setup lang="ts">
import { PlusIcon, FunnelIcon } from '@heroicons/vue/24/solid'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Button from './components/Button.vue'
import TravelCard from './components/TravelCard.vue'
import Map from './components/Map.vue'
import { userName, trips } from './data'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto w-full max-w-4xl px-6 pt-20">
      <Navbar />

      <h2 class="mt-8 mb-6 text-2xl text-gray-900">Willkommen zurück, {{ userName }}! 🌍</h2>

      <Map class="my-6 h-128 w-full rounded-lg" />
      <div class="mb-6 flex gap-3">
        <Button variant="primary"><PlusIcon class="h-5 w-5" /> Add</Button>
        <Button variant="secondary"><FunnelIcon class="h-5 w-5" /> Filter</Button>
      </div>
      <div class="flex flex-1 flex-col justify-center pb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TravelCard v-for="trip in trips" :key="trip.id" :title="trip.title" :text="trip.text" />
        </div>
      </div>

      <Footer />
    </div>
  </div>
</template>
