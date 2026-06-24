<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchMarketingStats, type MarketingStats } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const stats = ref<MarketingStats | null>(null)
const loading = ref(true)
const error = ref('')

const countryNames: Record<string, string> = {
  DE: 'Deutschland', US: 'USA', JP: 'Japan', IT: 'Italien', ES: 'Spanien',
  FR: 'Frankreich', GB: 'Großbritannien', AU: 'Australien', NZ: 'Neuseeland',
  NO: 'Norwegen', MA: 'Marokko', CL: 'Chile', PT: 'Portugal', AT: 'Österreich',
  BR: 'Brasilien', CN: 'China', IN: 'Indien', MX: 'Mexiko', TH: 'Thailand',
}

function countryLabel(code: string): string {
  return countryNames[code] ?? code
}

const maxMonthCount = computed(() =>
  Math.max(1, ...(stats.value?.tripsPerMonth.map((m) => m.count) ?? [1])),
)

const maxCountryCount = computed(() =>
  Math.max(1, ...(stats.value?.topCountries.map((c) => c.tripCount) ?? [1])),
)

onMounted(async () => {
  try {
    stats.value = await fetchMarketingStats()
  } catch {
    error.value = 'Fehler beim Laden der Statistiken.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pt-20">
      <Navbar />

      <main class="flex-1 pb-12">
        <div class="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold text-gray-900">Plattform-Statistiken</h1>
            <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Marketing
            </span>
          </div>
          <span class="text-sm text-gray-500">Nur lesend</span>
        </div>

        <div v-if="loading" class="text-gray-500">Laden...</div>
        <div v-else-if="error" class="rounded-xl bg-red-50 p-3 text-sm text-red-600">{{ error }}</div>

        <template v-else-if="stats">
          <!-- KPI cards -->
          <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div class="rounded-2xl border border-gray-200 bg-white p-4">
              <div class="mb-1 text-xs text-gray-500">Trips gesamt</div>
              <div class="text-3xl font-semibold text-gray-900">{{ stats.totalTrips }}</div>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white p-4">
              <div class="mb-1 text-xs text-gray-500">Nutzer:innen</div>
              <div class="text-3xl font-semibold text-gray-900">{{ stats.totalUsers }}</div>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white p-4">
              <div class="mb-1 text-xs text-gray-500">Länder besucht</div>
              <div class="text-3xl font-semibold text-gray-900">{{ stats.countriesVisited }}</div>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white p-4">
              <div class="mb-1 text-xs text-gray-500">Kommentare</div>
              <div class="text-3xl font-semibold text-gray-900">{{ stats.totalComments }}</div>
            </div>
          </div>

          <!-- Trips per month -->
          <div class="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
            <h2 class="mb-4 text-sm font-medium text-gray-700">Trips pro Monat</h2>
            <div v-if="stats.tripsPerMonth.length === 0" class="py-4 text-center text-sm text-gray-400">
              Keine Daten vorhanden.
            </div>
            <div v-else class="flex items-end gap-1.5" style="height: 96px">
              <div
                v-for="item in stats.tripsPerMonth"
                :key="item.month"
                class="group relative flex flex-1 flex-col items-center justify-end"
                style="height: 100%"
              >
                <div
                  class="w-full rounded-t-lg bg-blue-400"
                  :style="{ height: Math.max(4, (item.count / maxMonthCount) * 72) + 'px' }"
                />
                <span class="mt-1 block text-[9px] text-gray-400">
                  {{ item.month.slice(5) }}/{{ item.month.slice(2, 4) }}
                </span>
                <span
                  class="absolute -top-6 hidden rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-white group-hover:block"
                >
                  {{ item.count }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Top countries -->
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
              <h2 class="mb-4 text-sm font-medium text-gray-700">Meistbesuchte Länder</h2>
              <div v-if="stats.topCountries.length === 0" class="text-sm text-gray-400">Keine Daten.</div>
              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="(c, i) in stats.topCountries.slice(0, 8)"
                  :key="c.countryCode"
                  class="flex items-center gap-3 text-sm"
                >
                  <span class="w-4 text-right text-xs text-gray-400">{{ i + 1 }}</span>
                  <span class="w-24 truncate text-gray-700">{{ countryLabel(c.countryCode) }}</span>
                  <div class="flex-1 overflow-hidden rounded-full bg-gray-100" style="height: 6px">
                    <div
                      class="h-full rounded-full bg-blue-400"
                      :style="{ width: (c.tripCount / maxCountryCount) * 100 + '%' }"
                    />
                  </div>
                  <span class="w-6 text-right text-xs text-gray-500">{{ c.tripCount }}</span>
                </div>
              </div>
            </div>

            <!-- Top users -->
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
              <h2 class="mb-4 text-sm font-medium text-gray-700">Aktivste Nutzer:innen</h2>
              <div v-if="stats.topUsers.length === 0" class="text-sm text-gray-400">Keine Daten.</div>
              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="(u, i) in stats.topUsers"
                  :key="u.username"
                  class="flex items-center gap-3 text-sm"
                >
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                    :class="i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ i + 1 }}
                  </span>
                  <span class="flex-1 text-gray-800">@{{ u.username }}</span>
                  <span class="text-xs text-gray-500">{{ u.tripCount }} Trips</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <Footer />
    </div>
  </div>
</template>
