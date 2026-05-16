<script setup lang="ts">
import placeholder from '../../assets/placeholder.png'

defineProps<{
  id: number
  location: string
  date: string
  text: string
  flag: string
}>()
</script>

<template>
  <router-link
    :to="{ name: 'trip-detail', params: { id } }"
    class="relative flex h-full flex-col rounded-3xl border-2 border-zinc-300 bg-white p-4 duration-300 hover:border-blue-600"
  >
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">{{ flag }}</span>
        <h2 class="text-xl text-gray-800">{{ location }}</h2>
      </div>
      <span class="text-sm text-gray-500">{{ date }}</span>
    </div>

    <p class="mb-4 text-sm text-gray-600">{{ text }}</p>
    <div class="mt-auto flex gap-2 overflow-x-auto">
      <img :src="placeholder" alt="placeholder" class="w-18 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="w-18 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="w-18 rounded-lg object-cover" />
    </div>
  </router-link>
</template>
