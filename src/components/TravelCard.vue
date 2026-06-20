<script setup lang="ts">
import placeholder from '../../assets/placeholder.png'

defineProps<{
  id: number
  title: string
}>()
</script>

<template>
  <router-link
    :to="{ name: 'trip-detail', params: { id } }"
    class="group block aspect-square overflow-hidden rounded-2xl bg-gray-200"
    :aria-label="`${title} ansehen`"
  >
    <img
      :src="placeholder"
      :alt="title"
      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  </router-link>
</template>
