<template>
  <footer class="mt-8 border-t border-gray-200 py-6">
    <div class="flex flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
      <p>&copy; {{ new Date().getFullYear() }} Travelmap</p>
      <div class="flex flex-wrap justify-center gap-4">
        <router-link :to="{ name: 'impressum' }" class="transition-colors hover:text-gray-900">
          Impressum
        </router-link>
        <router-link :to="{ name: 'datenschutz' }" class="transition-colors hover:text-gray-900">
          Datenschutz
        </router-link>
        <router-link :to="{ name: 'home', hash: '#contact' }" class="transition-colors hover:text-gray-900">
          Kontakt
        </router-link>
      </div>
    </div>
  </footer>
</template>
