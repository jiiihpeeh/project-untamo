import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [preact()],
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
      minify: true,
  },
})
