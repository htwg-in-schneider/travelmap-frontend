<script setup lang="ts">
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import TravelCard from './components/TravelCard.vue'
import Map from './components/Map.vue'

const trips = [
  { id: 1, title: 'Tokio 2025' },
  { id: 2, title: 'Paris 2024' },
  { id: 3, title: 'New York 2023' },
  { id: 4, title: 'Cape Town 2022' },
  { id: 5, title: 'Rio de Janeiro 2021' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="max-w-4xl mx-auto px-6 w-full">
      <header class="py-4 flex justify-between items-center">
        <MagnifyingGlassIcon class="w-8 h-8 text-gray-600" />
        <UserIcon class="w-8 h-8 text-gray-600" />
      </header>

      <h2 class="text-2xl mt-8 mb-6 text-gray-900">Willkommen zurück Max! 🌍</h2>

      <Map class="h-128 w-full rounded-lg my-6" />
      <div class="flex-1 flex flex-col justify-center pb-6">
        <div class="grid grid-cols-2 gap-4">
          <TravelCard v-for="trip in trips" :key="trip.id" :title="trip.title" />
        </div>
      </div>
    </div>
  </div>
</template>
