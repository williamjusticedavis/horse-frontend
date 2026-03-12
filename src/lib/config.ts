/**
 * Central app configuration.
 *
 * Values are resolved at build time by Vite:
 *   - import.meta.env.DEV   → true during `bun run dev`
 *   - import.meta.env.PROD  → true after `bun run build`
 *
 * Override any default by setting the corresponding variable in your .env file.
 */
export const config = {
  /**
   * Backend API base URL.
   *
   * Dev default  → http://localhost:8000  (your local API server)
   * Prod default → ''  (same origin — assumes the API is served alongside the frontend)
   *
   * Override: set VITE_API_URL in .env, e.g. https://api.example.com
   */
  apiUrl: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : ''),

  /**
   * URL path prefix the app is served from.
   *
   * Default → '/'  (app lives at the root)
   * Example → '/template' means the app lives at localhost:5173/template
   *
   * Must match the `base` in vite.config.ts and `basepath` in createRouter().
   * Override: set VITE_BASE_PATH in .env, e.g. /my-app
   */
  basePath: import.meta.env.VITE_BASE_PATH ?? '/',
} as const
