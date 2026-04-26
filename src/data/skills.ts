import { z } from 'zod'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Category =
  | 'יציבה וישיבה'
  | 'שימוש בעזרים וטכניקות רכיבה'
  | 'עבודה מהקרקע'
  | 'קפיצות'
  | 'רגש, תיקון בעיות'

export interface SkillLevelData {
  level: Level
  description: string
  prerequisites: { skillId: string; level: Level }[]
}

export interface Skill {
  id: string
  name: string
  category: Category
  shortDescription: string
  longDescription: string
  levels: SkillLevelData[]
  createdAt: string
  updatedAt: string
}

export const CATEGORIES: Category[] = [
  'יציבה וישיבה',
  'שימוש בעזרים וטכניקות רכיבה',
  'עבודה מהקרקע',
  'קפיצות',
  'רגש, תיקון בעיות',
]

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

export const levelLabel: Record<Level, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

export type LevelBadgeVariant = 'success' | 'warning' | 'destructive'

export const levelBadgeVariant: Record<Level, LevelBadgeVariant> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'destructive',
}

/** Tailwind color classes for tabs / section headers */
export const levelTabActive: Record<Level, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400',
  intermediate: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-400',
  advanced: 'bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:text-rose-400',
}

export const levelTabInactive =
  'bg-transparent text-muted-foreground border border-transparent hover:bg-accent hover:text-accent-foreground'

export const levelSectionBorder: Record<Level, string> = {
  beginner: 'border-emerald-400',
  intermediate: 'border-amber-400',
  advanced: 'border-rose-400',
}

/** Zod schema for the skill form */
const prerequisiteSchema = z.object({
  skillId: z.string().min(1, 'בחר כישור'),
  level: z.enum(['beginner', 'intermediate', 'advanced'] as const),
})

const skillLevelSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced'] as const),
  description: z.string().min(1, 'שדה חובה'),
  prerequisites: z.array(prerequisiteSchema),
})

export const skillFormSchema = z.object({
  name: z.string().min(1, 'שדה חובה'),
  category: z.enum([
    'יציבה וישיבה',
    'שימוש בעזרים וטכניקות רכיבה',
    'עבודה מהקרקע',
    'קפיצות',
    'רגש, תיקון בעיות',
  ] as const),
  shortDescription: z.string().min(1, 'שדה חובה'),
  longDescription: z.string().min(1, 'שדה חובה'),
  levels: z.array(skillLevelSchema).length(3),
})

export type SkillFormData = z.infer<typeof skillFormSchema>

export function emptySkillForm(): SkillFormData {
  return {
    name: '',
    category: 'יציבה וישיבה',
    shortDescription: '',
    longDescription: '',
    levels: [
      { level: 'beginner', description: '', prerequisites: [] },
      { level: 'intermediate', description: '', prerequisites: [] },
      { level: 'advanced', description: '', prerequisites: [] },
    ],
  }
}

export function skillToForm(skill: Skill): SkillFormData {
  return {
    name: skill.name,
    category: skill.category,
    shortDescription: skill.shortDescription,
    longDescription: skill.longDescription,
    levels: LEVELS.map((l) => {
      const found = skill.levels.find((sl) => sl.level === l)
      return {
        level: l,
        description: found?.description ?? '',
        prerequisites: found?.prerequisites ?? [],
      }
    }),
  }
}
