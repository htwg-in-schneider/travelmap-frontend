<script setup lang="ts">
import placeholder from '../../assets/placeholder.png'

defineProps<{
  id: number
  title: string
  imageUrl?: string | null
}>()
</script>

<template>
  <router-link
    :to="{ name: 'trip-detail', params: { id } }"
    class="group relative block aspect-square overflow-hidden rounded-2xl bg-gray-200"
    :aria-label="`${title} ansehen`"
  >
    <img
      :src="imageUrl || placeholder"
      :alt="title"
      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
    <div
      class="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100"
    >
      <span class="line-clamp-2 text-sm font-medium text-white">{{ title }}</span>
    </div>
  </router-link>
</template>