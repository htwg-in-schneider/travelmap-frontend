<script setup lang="ts">
import { FunnelIcon } from '@heroicons/vue/24/solid'
import { CONTINENTS, type Continent } from '@/utils/continents'

type OrderBy = 'newest' | 'oldest' | 'most-commented' | ''

const props = defineProps<{
  continent: Continent | ''
  orderBy: OrderBy
}>()

const emit = defineEmits<{
  filter: [params: { continent: Continent | ''; orderBy: OrderBy }]
}>()

function emitFilter(next: Partial<{ continent: Continent | ''; orderBy: OrderBy }>) {
  emit('filter', {
    continent: next.continent ?? props.continent,
    orderBy: next.orderBy ?? props.orderBy,
  })
}

function onClear() {
  emit('filter', { continent: '', orderBy: '' })
}
</script>

<template>
  <div class="rounded-2xl border-2 border-gray-200 bg-white p-4">
    <div class="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
      <FunnelIcon class="h-4 w-4 text-gray-400" />
      <span>Filter trips</span>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <label class="flex flex-col gap-1.5 text-sm text-gray-700">
        <span class="font-medium">Continent</span>
        <select
          :value="continent"
          class="rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-600"
          @change="
            emitFilter({
              continent: ($event.target as HTMLSelectElement).value as Continent | '',
            })
          "
        >
          <option value="">All continents</option>
          <option v-for="item in CONTINENTS" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label class="flex flex-col gap-1.5 text-sm text-gray-700">
        <span class="font-medium">Order By</span>
        <select
          :value="orderBy"
          class="rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-600"
          @change="
            emitFilter({
              orderBy: ($event.target as HTMLSelectElement).value as OrderBy,
            })
          "
        >
          <option value="">Default order</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="most-commented">Most commented</option>
        </select>
      </label>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        v-if="continent || orderBy"
        @click="onClear"
        class="rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 transition-colors hover:border-blue-600 hover:text-blue-600"
      >
        Reset filters
      </button>
    </div>
  </div>
</template>
