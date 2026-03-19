import type { TagCategory } from '@/data/horses'

export interface TagOption {
  category: TagCategory
  label: string
}

export interface EditTag {
  category: TagCategory
  label: string
  note: string
}

export interface EditForm {
  name: string
  age: string
  description: string
  fullDescription: string
  breed: string
  color: string
  tags: EditTag[]
}
