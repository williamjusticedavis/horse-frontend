import { z } from 'zod'

export type Domain = 'רגשי' | 'תקשורתי' | 'מוטורי' | 'חברתי' | 'התנהגותי'

export interface TherapyCard {
  id: string
  title: string
  domain: Domain
  description: string
  howItHelps: string
  inPractice: string
  contraindications: string
  tags: string[]
}

export const DOMAINS: Domain[] = ['רגשי', 'תקשורתי', 'מוטורי', 'חברתי', 'התנהגותי']

export const TAG_VOCABULARY = [
  'ויסות',
  'מודעות',
  'חיזוק',
  'ביטחון',
  'חברתי',
  'תקשורתי',
  'רגשי',
  'מוטורי',
  'התנהגותי',
] as const

export const domainBorder: Record<Domain, string> = {
  רגשי: 'border-t-blue-400',
  תקשורתי: 'border-t-purple-400',
  מוטורי: 'border-t-green-400',
  חברתי: 'border-t-orange-400',
  התנהגותי: 'border-t-gray-400',
}

export const domainBadgeVariant: Record<
  Domain,
  'info' | 'purple' | 'success' | 'orange' | 'secondary'
> = {
  רגשי: 'info',
  תקשורתי: 'purple',
  מוטורי: 'success',
  חברתי: 'orange',
  התנהגותי: 'secondary',
}

export const cardFormSchema = z.object({
  title: z.string().min(1, 'שדה חובה'),
  domain: z.enum(['רגשי', 'תקשורתי', 'מוטורי', 'חברתי', 'התנהגותי'] as const),
  description: z.string().min(1, 'שדה חובה'),
  howItHelps: z.string().min(1, 'שדה חובה'),
  inPractice: z.string().min(1, 'שדה חובה'),
  contraindications: z.string().min(1, 'שדה חובה'),
  tags: z.array(z.string()),
})

export type CardFormData = z.infer<typeof cardFormSchema>
export type CardFormErrors = Partial<Record<keyof CardFormData, string>>

export function emptyForm(card?: TherapyCard): CardFormData {
  return {
    title: card?.title ?? '',
    domain: card?.domain ?? 'רגשי',
    description: card?.description ?? '',
    howItHelps: card?.howItHelps ?? '',
    inPractice: card?.inPractice ?? '',
    contraindications: card?.contraindications ?? '',
    tags: card?.tags ?? [],
  }
}
