<script setup lang="ts">
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/vue/24/outline'
import placeholder from '../../assets/placeholder.png'

defineProps<{
  id: number
  location: string
  date: string
  text: string
}>()
</script>

<template>
  <router-link
    :to="{ name: 'trip-detail', params: { id } }"
    class="relative flex h-full flex-col rounded-3xl border-2 border-zinc-300 bg-white p-4 duration-300 hover:border-blue-600"
  >
    <h2 class="mb-2 text-xl text-gray-800">{{ location }}</h2>

    <p class="mb-4 text-sm text-gray-600">{{ text }}</p>
    <div class="mt-auto flex items-center gap-2 overflow-x-auto">
      <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />
      <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />

      <div class="relative h-12 w-12 shrink-0">
        <img :src="placeholder" alt="placeholder" class="h-12 w-12 rounded-lg object-cover" />
        <div
          class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-xs font-semibold text-white"
        >
          +3
        </div>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between text-gray-400">
      <div class="flex items-center gap-5">
        <button class="flex items-center gap-1.5 transition-colors hover:text-red-500">
          <HeartIcon class="h-5 w-5" />
          <span class="text-xs font-medium">0</span>
        </button>
        <button class="flex items-center gap-1.5 transition-colors hover:text-blue-500">
          <ChatBubbleOvalLeftIcon class="h-5 w-5" />
          <span class="text-xs font-medium">0</span>
        </button>
        <button class="flex items-center gap-1.5 transition-colors hover:text-green-500">
          <ArrowPathRoundedSquareIcon class="h-5 w-5" />
          <span class="text-xs font-medium">0</span>
        </button>
      </div>
      <span class="text-xs text-gray-500">{{ date }}</span>
    </div>
  </router-link>
</template>
