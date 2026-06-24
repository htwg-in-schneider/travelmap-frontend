<script setup lang="ts">
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid'
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    label?: string
    align?: 'left' | 'right'
  }>(),
  {
    label: 'Optionen öffnen',
    align: 'right',
  },
)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value) return
  if (event.target instanceof Node && !root.value.contains(event.target)) {
    close()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div ref="root" class="relative inline-flex">
    <button
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="label"
      @click="toggle"
    >
      <EllipsisVerticalIcon class="h-5 w-5" />
    </button>

    <div
      v-if="open"
      class="absolute top-full z-20 mt-2 min-w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg"
      :class="align === 'left' ? 'left-0' : 'right-0'"
      role="menu"
    >
      <slot :close="close" />
    </div>
  </div>
</template>
