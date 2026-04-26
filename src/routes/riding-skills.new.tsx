import { createFileRoute } from '@tanstack/react-router'
import { SkillFormPage } from '@/pages/riding-skills-form'

export const Route = createFileRoute('/riding-skills/new')({
  component: () => <SkillFormPage />,
})
