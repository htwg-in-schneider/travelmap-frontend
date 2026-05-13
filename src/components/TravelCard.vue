<script setup lang="ts">
import placeholder from '../../assets/placeholder.png'

defineProps<{
  title: string
  text: string
}>()
</script>

<template>
  <div class="border border-zinc-300 rounded-xl p-4 bg-white shadow-sm">
    <h2 class="text-xl font-bold mb-2 text-gray-800">{{ title }}</h2>
    <p class="text-gray-600 mb-4 text-sm">{{ text }}</p>
    <div class="flex gap-2 overflow-x-auto">
      <img :src="placeholder" alt="placeholder" class="w-20 object-cover rounded-lg" />
      <img :src="placeholder" alt="placeholder" class="w-20 object-cover rounded-lg" />
      <img :src="placeholder" alt="placeholder" class="w-20 object-cover rounded-lg" />
    </div>
  </div>
</template>
