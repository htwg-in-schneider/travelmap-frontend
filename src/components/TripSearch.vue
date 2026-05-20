<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  searchTerm: string
}>()

const emit = defineEmits<{
  search: [params: { query: string }]
}>()

function onClear() {
  emit('search', { query: '' })
}
</script>

<template>
  <div class="flex gap-2">
    <div class="relative flex-1">
      <MagnifyingGlassIcon
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <input
        :value="searchTerm"
        type="text"
        placeholder="Reise suchen…"
        class="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-600"
        @input="emit('search', { query: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <button
      v-if="searchTerm"
      @click="onClear"
      class="rounded-xl border-2 border-gray-300 bg-white px-3 text-sm text-gray-500 transition-colors hover:border-blue-600 hover:text-blue-600"
    >
      Löschen
    </button>
  </div>
</template>
