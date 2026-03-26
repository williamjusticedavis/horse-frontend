import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  DOMAINS,
  TAG_VOCABULARY,
  cardFormSchema,
  emptyForm,
  type TherapyCard,
  type CardFormData,
  type CardFormErrors,
} from '@/data/therapy'

export function CardModal({
  open,
  onClose,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean
  onClose: () => void
  initial?: TherapyCard
  onSubmit: (data: CardFormData) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<CardFormData>(() => emptyForm(initial))
  const [errors, setErrors] = useState<CardFormErrors>({})
  const [addingTag, setAddingTag] = useState(false)
  const [tagInput, setTagInput] = useState('')

  if (!open) return null

  function handleChange(field: keyof CardFormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  function commitCustomTag() {
    const label = tagInput.trim()
    if (label && !form.tags.includes(label)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, label] }))
    }
    setTagInput('')
    setAddingTag(false)
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    const result = cardFormSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: CardFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CardFormData
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    onSubmit(result.data)
  }

  const fields: { key: keyof CardFormData; label: string; multiline?: boolean }[] = [
    { key: 'title', label: 'כותרת' },
    { key: 'description', label: 'תיאור הקושי', multiline: true },
    { key: 'howItHelps', label: 'איך הרכיבה עוזרת', multiline: true },
    { key: 'inPractice', label: '🔧 איך זה נראה בפועל', multiline: true },
    { key: 'contraindications', label: '⚠️ התאמות חשובות', multiline: true },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-background border-border w-full max-w-lg rounded-xl border shadow-xl"
        dir="rtl"
      >
        <div className="border-border border-b p-6">
          <h2 className="text-lg font-semibold">{initial ? 'עריכת כרטיסיה' : 'כרטיסיה חדשה'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Domain selector */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">תחום</label>
              <select
                value={form.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.domain && <p className="text-destructive mt-1 text-xs">{errors.domain}</p>}
            </div>

            {/* Text fields */}
            {fields.map(({ key, label, multiline }) => (
              <div key={key}>
                <label className="text-muted-foreground mb-1 block text-sm">{label}</label>
                {multiline ? (
                  <textarea
                    value={form[key] as string}
                    onChange={(e) => handleChange(key, e.target.value)}
                    rows={3}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key] as string}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  />
                )}
                {errors[key] && <p className="text-destructive mt-1 text-xs">{errors[key]}</p>}
              </div>
            ))}

            {/* Tags */}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm">תגיות</label>
              <div className="flex flex-wrap gap-2">
                {TAG_VOCABULARY.map((tag) => {
                  const active = form.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={active ? 'teal' : 'outline'}
                        className={active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                      >
                        #{tag}
                      </Badge>
                    </button>
                  )
                })}
                {form.tags
                  .filter((t) => !(TAG_VOCABULARY as readonly string[]).includes(t))
                  .map((tag) => (
                    <span key={tag} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer text-xs leading-none"
                        title="הסר"
                      >
                        ✕
                      </button>
                      <Badge variant="teal">#{tag}</Badge>
                    </span>
                  ))}
                {addingTag ? (
                  <input
                    autoFocus
                    className="border-border bg-background text-foreground rounded-md border px-2 py-0.5 text-xs focus:outline-none focus:ring-1"
                    style={{ width: '8rem' }}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitCustomTag()
                      }
                      if (e.key === 'Escape') {
                        setAddingTag(false)
                        setTagInput('')
                      }
                    }}
                    onBlur={commitCustomTag}
                    placeholder="תגית חדשה..."
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingTag(true)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                  >
                    + הוסף
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : initial ? 'שמור' : 'צור כרטיסיה'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
