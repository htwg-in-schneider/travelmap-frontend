<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100]">
      <button
        class="absolute inset-0 h-full w-full bg-gray-900/45"
        aria-label="Dialog schließen"
        type="button"
        :disabled="loading"
        @click="$emit('cancel')"
      />
      <section
        class="absolute top-1/2 left-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="mb-4 flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">{{ message }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            :disabled="loading"
            @click="$emit('cancel')"
          >
            {{ cancelLabel ?? 'Abbrechen' }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            {{ loading ? 'Wird gelöscht…' : (confirmLabel ?? 'Löschen') }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
