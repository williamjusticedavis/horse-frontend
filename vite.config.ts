import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files — process.env alone won't see them in vite.config.ts
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Must match config.basePath in src/lib/config.ts.
    // Set VITE_BASE_PATH in .env to deploy under a sub-path, e.g. /template
    base: env.VITE_BASE_PATH ?? '/',
    plugins: [tanstackRouter({ routesDirectory: './src/routes' }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
