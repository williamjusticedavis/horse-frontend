import { useEffect, useRef, useState } from 'react'
import { useRouter, useBlocker } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { getAccessToken } from '@/lib/auth-token'
import { useAuth } from '@/context/auth-context'
import { categoryVariant, categoryLabel, categoryOrder, type Horse, type TagCategory } from '@/data/horses'
import { Route } from '@/routes/horse.$id'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagOption {
  category: TagCategory
  label: string
}

interface EditTag {
  category: TagCategory
  label: string
  note: string
}

interface EditForm {
  name: string
  age: string
  description: string
  fullDescription: string
  breed: string
  color: string
  imageEmoji: string
  tags: EditTag[]
}

function horseToForm(horse: Horse): EditForm {
  return {
    name: horse.name,
    age: String(horse.age),
    description: horse.description,
    fullDescription: horse.fullDescription ?? '',
    breed: horse.breed ?? '',
    color: horse.color ?? '',
    imageEmoji: horse.imageEmoji ?? '',
    tags: horse.tags.map((t) => ({ category: t.category, label: t.label, note: t.note ?? '' })),
  }
}

// ── Image block ───────────────────────────────────────────────────────────────

function HorseImage({
  horse,
  editMode,
  onFileSelect,
  previewUrl,
}: {
  horse: Horse
  editMode: boolean
  onFileSelect: (file: File) => void
  previewUrl: string | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const displayUrl = previewUrl ?? (horse.imageUrl ? `http://localhost:8000${horse.imageUrl}` : null)

  return (
    <div>
      <div className="bg-muted flex h-64 items-center justify-center overflow-hidden rounded-xl">
        {displayUrl ? (
          <img src={displayUrl} alt={horse.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-8xl">{horse.imageEmoji ?? '🐴'}</span>
        )}
      </div>
      {editMode && (
        <div className="mt-2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {displayUrl ? 'החלף תמונה' : 'העלה תמונה'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFileSelect(f)
            }}
          />
          <span className="text-muted-foreground text-xs">JPEG, PNG, WebP, GIF · עד 5MB</span>
        </div>
      )}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

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

  // ── Edit state ────────────────────────────────────────────────────────────────

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<EditForm | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const isDirty = isEditing && form !== null

  useBlocker({
    blockerFn: () => window.confirm('יש שינויים שלא נשמרו. לצאת בכל זאת?'),
    condition: isDirty,
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
        return { ...prev, tags: prev.tags.filter((t) => !(t.category === category && t.label === label)) }
      }
      return { ...prev, tags: [...prev.tags, { category, label, note: '' }] }
    })
  }

  function setTagNote(category: TagCategory, label: string, note: string) {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tags: prev.tags.map((t) => (t.category === category && t.label === label ? { ...t, note } : t)),
      }
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form) return

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const token = getAccessToken()
        const res = await fetch(`http://localhost:8000/api/horses/${id}/image`, {
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
        imageEmoji: form.imageEmoji || null,
        tags: form.tags.map((t) => ({ category: t.category, label: t.label, note: t.note || null })),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horse', id] })
      queryClient.invalidateQueries({ queryKey: ['horses'] })
      setIsEditing(false)
      setForm(null)
      setImageFile(null)
      setImagePreview(null)
    },
  })

  // ── Render ────────────────────────────────────────────────────────────────────

  const inputClass =
    'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1'
  const textareaClass = `${inputClass} min-h-20 resize-y`

  return (
    <div className="mx-auto max-w-2xl space-y-8" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.history.back()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
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
          <div className="bg-muted flex h-64 items-center justify-center overflow-hidden rounded-xl">
            {horse.imageUrl ? (
              <img
                src={`http://localhost:8000${horse.imageUrl}`}
                alt={horse.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-8xl">{horse.imageEmoji ?? '🐴'}</span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-foreground text-4xl font-bold">{horse.name}</h1>
            <p className="text-muted-foreground">גיל: {horse.age}</p>
          </div>

          <div className="space-y-3">
            {categoryOrder.map((cat) => {
              const tags = horse.tags.filter((t) => t.category === cat)
              if (tags.length === 0) return null
              return (
                <div key={cat} className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-0.5 w-12 shrink-0 text-xs font-medium">
                    {categoryLabel[cat]}:
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-2">
                        <Badge variant={categoryVariant[cat]}>{tag.label}</Badge>
                        {tag.note && <span className="text-muted-foreground text-sm">{tag.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

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

          <p className="text-foreground leading-relaxed">{horse.fullDescription ?? horse.description}</p>
        </>
      )}

      {/* ── Edit mode ── */}
      {horse && isEditing && form && (
        <div className="space-y-6">
          <HorseImage horse={horse} editMode onFileSelect={(f) => { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }} previewUrl={imagePreview} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="שם">
              <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </Field>
            <Field label="גיל">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setField('age', e.target.value)}
              />
            </Field>
          </div>

          <Field label="תיאור קצר">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
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
              <input className={inputClass} value={form.breed} onChange={(e) => setField('breed', e.target.value)} />
            </Field>
            <Field label="צבע (תיאורי)">
              <input className={inputClass} value={form.color} onChange={(e) => setField('color', e.target.value)} />
            </Field>
          </div>

          <Field label="אמוג׳י (גיבוי לתמונה)">
            <input
              className={inputClass}
              value={form.imageEmoji}
              onChange={(e) => setField('imageEmoji', e.target.value)}
            />
          </Field>

          {/* Tags */}
          <div className="space-y-4">
            <p className="text-foreground text-sm font-medium">תגיות</p>
            {categoryOrder.map((cat) => {
              const options = vocabulary.filter((v) => v.category === cat)
              if (options.length === 0) return null
              const selected = form.tags.filter((t) => t.category === cat)

              return (
                <div key={cat} className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium">{categoryLabel[cat]}</span>
                  <div className="flex flex-wrap gap-1">
                    {options.map(({ label }) => {
                      const isSelected = selected.some((t) => t.label === label)
                      return (
                        <button key={label} onClick={() => toggleTag(cat, label)}>
                          <Badge
                            variant={isSelected ? categoryVariant[cat] : 'outline'}
                            className={isSelected ? 'cursor-pointer' : 'cursor-pointer opacity-50 hover:opacity-80'}
                          >
                            {label}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                  {selected.map((tag) => (
                    <div key={tag.label} className="flex items-center gap-2 pr-1">
                      <Badge variant={categoryVariant[cat]} className="shrink-0">
                        {tag.label}
                      </Badge>
                      <input
                        className={`${inputClass} flex-1`}
                        placeholder="הערה (רשות)..."
                        value={tag.note}
                        onChange={(e) => setTagNote(cat, tag.label, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {saveMutation.error && (
            <p className="text-destructive text-sm">שגיאה בשמירה: {saveMutation.error.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={cancelEdit} disabled={saveMutation.isPending}>
              ביטול
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Spinner /> : 'שמור שינויים'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
