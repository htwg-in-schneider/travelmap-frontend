<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
  }>(),
  {
    variant: 'primary',
  },
)
</script>

<template>
  <button
    :class="[
      'text-l inline-flex items-center justify-center rounded-lg px-4 py-1 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600'
        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ]"
  >
    <slot />
  </button>
</template>
