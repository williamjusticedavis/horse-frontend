import { createFileRoute } from '@tanstack/react-router'
import { HorsesPage } from '@/pages/horses'

export const Route = createFileRoute('/')({
  component: HorsesPage,
})
