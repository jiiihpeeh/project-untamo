import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login/index.html'),
        alarms: resolve(__dirname, 'alarms/index.html'),
        welcome: resolve(__dirname, 'welcome/index.html'),
        clueless: resolve(__dirname, 'clueless/index.html'),
        register: resolve(__dirname, 'register/index.html'),
      },
    },
  },
})
