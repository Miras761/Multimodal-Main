import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Эта опция напрямую вставляет значение переменной окружения из среды сборки (Vercel)
  // в клиентский код. Это самый надежный способ для работы с Vercel.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
})
