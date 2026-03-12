import { createFileRoute } from '@tanstack/react-router'
import { TherapyPage } from '@/pages/therapy'

export const Route = createFileRoute('/therapy')({
  component: TherapyPage,
})
