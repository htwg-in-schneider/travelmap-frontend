<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import TravelCard from './components/TravelCard.vue'
import Map from './components/Map.vue'
import { userName, trips } from './data'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto w-full max-w-4xl px-6 pt-20">
      <Navbar />

      <h2 class="mt-8 mb-6 text-2xl text-gray-900">Willkommen zurück {{ userName }}! 🌍</h2>

      <Map class="my-6 h-128 w-full rounded-lg" />
      <div class="flex flex-1 flex-col justify-center pb-6">
        <div class="grid grid-cols-2 gap-4">
          <TravelCard v-for="trip in trips" :key="trip.id" :title="trip.title" :text="trip.text" />
        </div>
      </div>

      <Footer />
    </div>
  </div>
</template>
