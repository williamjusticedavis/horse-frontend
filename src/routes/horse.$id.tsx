import { createFileRoute } from '@tanstack/react-router'
import { HorseDetailPage } from '@/pages/horse-detail'

export const Route = createFileRoute('/horse/$id')({
  component: HorseDetailPage,
})
