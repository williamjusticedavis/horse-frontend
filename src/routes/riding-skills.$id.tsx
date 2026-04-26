import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/riding-skills/$id')({
  component: () => <Outlet />,
})
