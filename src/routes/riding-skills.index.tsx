import { createFileRoute } from '@tanstack/react-router'
import { RidingSkillsPage } from '@/pages/riding-skills'

export const Route = createFileRoute('/riding-skills/')({
  component: RidingSkillsPage,
})
