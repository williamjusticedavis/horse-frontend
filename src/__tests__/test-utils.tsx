/**
 * Shared test helpers.
 *
 * renderWithProviders — wraps a component in the full provider stack
 * (QueryClient + Router + AuthContext). It awaits router.load() before
 * calling render() so the component is fully mounted in the DOM on return.
 */
import { type ReactNode } from 'react'
import { render, act, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { mock } from 'bun:test'
import { AuthContext } from '@/context/auth-context'

export function makeMockAuth(overrides: Partial<ReturnType<typeof _baseAuth>> = {}) {
  return { ..._baseAuth(), ...overrides }
}

function _baseAuth() {
  return {
    user: null as null | { id: string; email: string; role: 'admin' | 'user' },
    isLoading: false,
    isAuthenticated: false,
    login: mock(async (_email: string, _password: string) => {}),
    register: mock(async (_email: string, _password: string) => {}),
    logout: mock(async () => {}),
  }
}

/**
 * Render `component` with QueryClient, a TanStack Router, and a mock
 * AuthContext. Returns a standard RenderResult.
 *
 * Awaiting this call is required — the function calls router.load() so the
 * component is already mounted when the promise resolves.
 */
export async function renderWithProviders(
  component: () => ReactNode,
  {
    initialPath = '/',
    authOverrides = {},
  }: {
    initialPath?: string
    authOverrides?: Parameters<typeof makeMockAuth>[0]
  } = {}
): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const rootRoute = createRootRoute({ component })
  const horseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/horse/$id',
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([horseRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  // Load the matched route before rendering so the component is present in DOM.
  await router.load()

  const authValue = makeMockAuth(authOverrides)

  let result!: RenderResult
  await act(async () => {
    result = render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </QueryClientProvider>
    )
  })
  return result
}
