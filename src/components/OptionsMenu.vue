<script setup lang="ts">
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
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
const button = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})
const menuReady = ref(false)

function close() {
  open.value = false
  menuReady.value = false
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    menuReady.value = false
    await nextTick()
    updatePosition()
  }
}

function updatePosition() {
  if (!open.value || !button.value) return

  const rect = button.value.getBoundingClientRect()
  const menuWidth = menu.value?.offsetWidth ?? 192
  const menuHeight = menu.value?.offsetHeight ?? 0
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const gap = 8

  const fitsBelow = rect.bottom + gap + menuHeight <= viewportHeight - gap
  const top = fitsBelow
    ? rect.bottom + gap
    : Math.max(gap, rect.top - menuHeight - gap)

  const maxLeft = Math.max(gap, viewportWidth - menuWidth - gap)
  const preferredLeft = Math.min(Math.max(gap, rect.left), maxLeft)
  const preferredRight = Math.max(gap, viewportWidth - rect.right)

  menuStyle.value =
    props.align === 'left'
      ? {
          position: 'fixed',
          top: `${top}px`,
          left: `${preferredLeft}px`,
          right: 'auto',
        }
      : {
          position: 'fixed',
          top: `${top}px`,
          left: 'auto',
          right: `${preferredRight}px`,
        }
  menuReady.value = true
}

function onDocumentClick(event: MouseEvent) {
  if (!(event.target instanceof Node)) return
  const insideRoot = root.value?.contains(event.target) ?? false
  const insideMenu = menu.value?.contains(event.target) ?? false
  if (!insideRoot && !insideMenu) {
    close()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function onViewportChange() {
  if (open.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <div ref="root" class="inline-flex">
    <button
      ref="button"
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="label"
      @click="toggle"
    >
      <EllipsisVerticalIcon class="h-5 w-5" />
    </button>
  </div>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menu"
      class="z-50 min-w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg"
      :style="{ ...menuStyle, visibility: menuReady ? 'visible' : 'hidden' }"
      role="menu"
    >
      <slot :close="close" />
    </div>
  </Teleport>
</template>
