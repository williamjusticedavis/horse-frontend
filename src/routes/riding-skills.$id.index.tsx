import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SkillDetailPage } from '@/pages/riding-skills-detail'

const searchSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']).catch('beginner'),
})

export const Route = createFileRoute('/riding-skills/$id/')({
  component: SkillDetailPage,
  validateSearch: searchSchema,
})
