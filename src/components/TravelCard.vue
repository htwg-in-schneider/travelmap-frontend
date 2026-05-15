<script setup lang="ts">
import placeholder from '../../assets/placeholder.png'

defineProps<{
  title: string
  text: string
}>()
</script>

<template>
  <div
    class="rounded-xl border-2 border-zinc-300 bg-white p-4 shadow-sm duration-300 hover:border-blue-600"
  >
    <h2 class="mb-2 text-xl font-bold text-gray-800">{{ title }}</h2>
    <p class="mb-4 text-sm text-gray-600">{{ text }}</p>
    <div class="flex gap-2 overflow-x-auto">
      <img :src="placeholder" alt="placeholder" class="w-20 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="w-20 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="w-20 rounded-lg object-cover" />
    </div>
  </div>
</template>
