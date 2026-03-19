import { z } from 'zod'

export const HorseFormSchema = z.object({
  name: z.string().min(1, 'שם הסוס הוא שדה חובה'),
  age: z.coerce
    .number({ error: 'גיל חייב להיות מספר' })
    .int()
    .min(0, 'גיל לא יכול להיות שלילי'),
  description: z.string().min(1, 'תיאור קצר הוא שדה חובה'),
  fullDescription: z.string().optional(),
  breed: z.string().optional(),
  color: z.string().optional(),
})

export type HorseFormErrors = Partial<Record<keyof z.infer<typeof HorseFormSchema>, string>>
