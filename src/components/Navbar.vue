<script setup lang="ts">
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import logo from '../../assets/travelmap-logo.svg'
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gray-50/90 px-6 py-4 backdrop-blur-sm"
  >
    <div class="flex items-center gap-2">
      <img :src="logo" alt="Travelmap Logo" class="h-8 w-auto" />
      <span class="text-xl text-gray-900">Travelmap</span>
    </div>
    <div class="flex items-center gap-4">
      <MagnifyingGlassIcon class="h-8 w-8 text-gray-600" />
      <UserIcon class="h-8 w-8 text-gray-600" />
    </div>
  </nav>
</template>
