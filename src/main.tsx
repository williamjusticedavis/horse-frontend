import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/context/theme-context'
import { AuthProvider } from '@/context/auth-context'
import { ToasterWithTheme } from '@/components/toaster'
import { queryClient } from '@/lib/query-client'
import { config } from '@/lib/config'
import { routeTree } from './routeTree.gen'
import './styles/globals.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  basepath: config.basePath,
})

// Register the router for type safety across the app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ToasterWithTheme />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
