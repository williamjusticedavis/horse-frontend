import { useEffect, useState } from 'react'
import { useRouter, useBlocker } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { config } from '@/lib/config'
import { getAccessToken } from '@/lib/auth-token'
import { useAuth } from '@/context/auth-context'
import { type Horse, type TagCategory } from '@/data/horses'
import { HorseImage } from '@/components/horse/image-block'
import { TagDisplay } from '@/components/horse/tag-display'
import { TagEditor } from '@/components/horse/tag-editor'
import type { TagOption, EditForm } from '@/types/horse-edit'
import { HorseFormSchema, type HorseFormErrors } from '@/lib/horse-schema'
import { Route } from '@/routes/horse.$id'

function horseToForm(horse: Horse): EditForm {
  return {
    name: horse.name,
    age: String(horse.age),
    description: horse.description,
    fullDescription: horse.fullDescription ?? '',
    breed: horse.breed ?? '',
    color: horse.color ?? '',
    tags: horse.tags.map((t) => ({ category: t.category, label: t.label, note: t.note ?? '' })),
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

export function HorseDetailPage() {
  const { id } = Route.useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['horse', id],
    queryFn: () => api.get<{ horse: Horse }>(`/api/horses/${id}`),
  })

  const { data: vocabData } = useQuery({
    queryKey: ['tag-vocabulary'],
    queryFn: () => api.get<{ tags: TagOption[] }>('/api/horses/tag-vocabulary'),
    enabled: isAdmin,
  })

  const horse = data?.horse
  const vocabulary = vocabData?.tags ?? []

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<EditForm | null>(null)
  const [errors, setErrors] = useState<HorseFormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const isDirty = isEditing && form !== null

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false
      return !window.confirm('יש שינויים שלא נשמרו. לצאת בכל זאת?')
    },
  })

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function startEdit() {
    if (!horse) return
    setForm(horseToForm(horse))
    setImageFile(null)
    setImagePreview(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    if (isDirty && !window.confirm('יש שינויים שלא נשמרו. לבטל?')) return
    setIsEditing(false)
    setForm(null)
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
  }

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function toggleTag(category: TagCategory, label: string) {
    setForm((prev) => {
      if (!prev) return prev
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
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tags: prev.tags.map((t) =>
          t.category === category && t.label === label ? { ...t, note } : t
        ),
      }
    })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form) return

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const token = getAccessToken()
        const res = await fetch(`${config.apiUrl}/api/horses/${id}/image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        if (!res.ok) throw new Error(await res.text())
      }

      await api.patch(`/api/horses/${id}`, {
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
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horse', id] })
      queryClient.invalidateQueries({ queryKey: ['horses'] })
      setIsEditing(false)
      setForm(null)
      setErrors({})
      setImageFile(null)
      setImagePreview(null)
      toast.success('הסוס עודכן בהצלחה')
    },
  })

  function handleSave() {
    if (!form) return
    const result = HorseFormSchema.safeParse({ ...form })
    if (!result.success) {
      const fieldErrors: HorseFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof HorseFormErrors
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      toast.error('יש למלא את כל שדות החובה')
      requestAnimationFrame(() => {
        document.querySelector('[data-field-error]')?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        })
      })
      return
    }
    setErrors({})
    saveMutation.mutate()
  }

  const inputClass =
    'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1'
  const textareaClass = `${inputClass} min-h-20 resize-y`

  return (
    <div className="mx-auto max-w-2xl space-y-8" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.history.back()}
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm transition-colors"
        >
          <span>→</span>
          <span>חזרה לרשימת הסוסים</span>
        </button>
        {isAdmin && horse && !isEditing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            ✏️ עריכה
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {isError && <p className="text-destructive text-center">שגיאה בטעינת פרטי הסוס.</p>}

      {/* ── View mode ── */}
      {horse && !isEditing && (
        <>
          <HorseImage horse={horse} editMode={false} />

          <div className="space-y-1">
            <h1 className="text-foreground text-4xl font-bold">{horse.name}</h1>
            <p className="text-muted-foreground">גיל: {horse.age}</p>
          </div>

          <TagDisplay tags={horse.tags} />

          {(horse.breed || horse.color) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {horse.breed && (
                <div>
                  <span className="text-muted-foreground font-medium">גזע: </span>
                  <span>{horse.breed}</span>
                </div>
              )}
              {horse.color && (
                <div>
                  <span className="text-muted-foreground font-medium">צבע: </span>
                  <span>{horse.color}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-muted-foreground">{horse.description}</p>

          {horse.fullDescription && (
            <p className="text-foreground leading-relaxed">{horse.fullDescription}</p>
          )}
        </>
      )}

      {/* ── Edit mode ── */}
      {horse && isEditing && form && (
        <div className="space-y-6">
          <HorseImage
            horse={horse}
            editMode
            onFileSelect={(f) => {
              setImageFile(f)
              setImagePreview(URL.createObjectURL(f))
            }}
            previewUrl={imagePreview}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field label="שם *">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              {errors.name && (
                <p data-field-error className="text-destructive mt-0.5 text-xs">
                  {errors.name}
                </p>
              )}
            </Field>
            <Field label="גיל *">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setField('age', e.target.value)}
              />
              {errors.age && (
                <p data-field-error className="text-destructive mt-0.5 text-xs">
                  {errors.age}
                </p>
              )}
            </Field>
          </div>

          <Field label="תיאור קצר *">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            {errors.description && (
              <p data-field-error className="text-destructive mt-0.5 text-xs">
                {errors.description}
              </p>
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

          {saveMutation.error && (
            <p className="text-destructive text-sm">שגיאה בשמירה: {saveMutation.error.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={cancelEdit} disabled={saveMutation.isPending}>
              ביטול
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Spinner /> : 'שמור שינויים'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
