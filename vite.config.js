import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require('path')
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  base: "./",
  plugins: [mkcert(), vue({
    compilerOptions: {
      customElement: true,
    },
  })],
  build: {
    manifest: true,
    rollupOptions: {
      input: ['./src/main.js', './index.html', 'index.fr.html', 'editor.html'],
    },
  }
})
