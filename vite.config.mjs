import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [basicSsl(), vue({
    compilerOptions: {
      customElement: true,
    },
  })],
  build: {
    manifest: true,
    rollupOptions: {
      input: ['./src/main.js', './index.html', 'index.fr.html', 'editor.html'],
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
