import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

const repoName = '/travelmap-frontend/'
const spaFallbackPlugin = {
  name: 'github-pages-spa-fallback',
  closeBundle() {
    const indexPath = new URL('./dist/index.html', import.meta.url)
    const fallbackPath = new URL('./dist/404.html', import.meta.url)

    if (existsSync(indexPath)) {
      copyFileSync(indexPath, fallbackPath)
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? repoName : '/',
  plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools(), spaFallbackPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
