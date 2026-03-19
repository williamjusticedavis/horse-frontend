import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { type Horse, type TagCategory } from '@/data/horses'
import { TagEditor } from '@/components/horse/tag-editor'
import type { TagOption, EditForm } from '@/types/horse-edit'
import { HorseFormSchema, type HorseFormErrors } from '@/lib/horse-schema'

const inputClass =
  'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1'
const textareaClass = `${inputClass} min-h-20 resize-y`

function emptyForm(): EditForm {
  return {
    name: '',
    age: '0',
    description: '',
    fullDescription: '',
    breed: '',
    color: '',
    tags: [],
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

export function CreateHorseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<EditForm>(emptyForm)
  const [errors, setErrors] = useState<HorseFormErrors>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: vocabData } = useQuery({
    queryKey: ['tag-vocabulary'],
    queryFn: () => api.get<{ tags: TagOption[] }>('/api/horses/tag-vocabulary'),
    enabled: open,
  })
  const vocabulary = vocabData?.tags ?? []

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleTag(category: TagCategory, label: string) {
    setForm((prev) => {
      const exists = prev.tags.find((t) => t.category === category && t.label === label)
      if (exists) {
        return {
          ...prev,
          tags: prev.tags.filter((t) => !(t.category === category && t.label === label)),
        }
      }
      return { ...prev, tags: [...prev.tags, { category, label, note: '' }] }
    })
  }

  function setTagNote(category: TagCategory, label: string, note: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.map((t) =>
        t.category === category && t.label === label ? { ...t, note } : t
      ),
    }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ horse: Horse }>('/api/horses', {
        name: form.name,
        age: Number(form.age),
        description: form.description,
        fullDescription: form.fullDescription || null,
        breed: form.breed || null,
        color: form.color || null,
        tags: form.tags.map((t) => ({
          category: t.category,
          label: t.label,
          note: t.note || null,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horses'] })
      queryClient.invalidateQueries({ queryKey: ['tag-vocabulary'] })
      toast.success('הסוס נוצר בהצלחה')
      setForm(emptyForm())
      setErrors({})
      onClose()
    },
  })

  function handleSubmit() {
    const result = HorseFormSchema.safeParse({ ...form, age: form.age })
    if (!result.success) {
      const fieldErrors: HorseFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof HorseFormErrors
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      toast.error('יש למלא את כל שדות החובה')
      requestAnimationFrame(() => {
        scrollRef.current?.querySelector('[data-field-error]')?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        })
      })
      return
    }
    setErrors({})
    mutation.mutate()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={scrollRef}
        className="bg-background border-border max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-bold">הוסף סוס חדש</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="שם *">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              {errors.name && <p data-field-error className="text-destructive text-xs mt-0.5">{errors.name}</p>}
            </Field>
            <Field label="גיל *">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setField('age', e.target.value)}
              />
              {errors.age && <p data-field-error className="text-destructive text-xs mt-0.5">{errors.age}</p>}
            </Field>
          </div>

          <Field label="תיאור קצר *">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            {errors.description && (
              <p data-field-error className="text-destructive text-xs mt-0.5">{errors.description}</p>
            )}
          </Field>

          <Field label="תיאור מלא">
            <textarea
              className={`${textareaClass} min-h-32`}
              value={form.fullDescription}
              onChange={(e) => setField('fullDescription', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="גזע">
              <input
                className={inputClass}
                value={form.breed}
                onChange={(e) => setField('breed', e.target.value)}
              />
            </Field>
            <Field label="צבע (תיאורי)">
              <input
                className={inputClass}
                value={form.color}
                onChange={(e) => setField('color', e.target.value)}
              />
            </Field>
          </div>

          <TagEditor
            vocabulary={vocabulary}
            tags={form.tags}
            onToggle={toggleTag}
            onSetNote={setTagNote}
          />

          {mutation.error && (
            <p className="text-destructive text-sm">שגיאה: {mutation.error.message}</p>
          )}

        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner /> : 'צור סוס'}
          </Button>
        </div>
      </div>
    </div>
  )
}
