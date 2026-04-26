import { createFileRoute } from '@tanstack/react-router'
import { SkillFormPage } from '@/pages/riding-skills-form'

export const Route = createFileRoute('/riding-skills/$id/edit')({
  component: EditSkillPage,
})

function EditSkillPage() {
  const { id } = Route.useParams()
  return <SkillFormPage skillId={id} />
}
