import type { BadgeVariant } from '@/components/ui/badge'

export type TagCategory =
  | 'age'
  | 'temperament'
  | 'level'
  | 'purpose'
  | 'gender'
  | 'size'
  | 'color'
  | 'seniority'

export interface HorseTag {
  id: number
  category: TagCategory
  label: string
  note: string | null
}

export interface Horse {
  id: number
  name: string
  age: number
  description: string
  fullDescription: string | null
  breed: string | null
  color: string | null
  imageUrl: string | null
  tags: HorseTag[]
}

export const categoryVariant: Record<TagCategory, BadgeVariant> = {
  age: 'secondary',
  temperament: 'warning',
  level: 'info',
  purpose: 'success',
  gender: 'default',
  size: 'purple',
  color: 'teal',
  seniority: 'orange',
}

export const categoryLabel: Record<TagCategory, string> = {
  age: 'גיל',
  temperament: 'מזג',
  level: 'רמה',
  purpose: 'ייעוד',
  gender: 'מין',
  size: 'גודל',
  color: 'צבע',
  seniority: 'ותק',
}

export const categoryOrder: TagCategory[] = [
  'gender',
  'size',
  'color',
  'age',
  'seniority',
  'temperament',
  'level',
  'purpose',
]
