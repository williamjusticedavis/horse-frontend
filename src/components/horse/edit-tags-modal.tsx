import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { type Horse, type TagCategory } from '@/data/horses'
import { TagEditor } from '@/components/horse/tag-editor'
import type { TagOption, EditTag } from '@/types/horse-edit'

export function EditTagsModal({
  horse,
  open,
  onClose,
}: {
  horse: Horse
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [tags, setTags] = useState<EditTag[]>([])

  useEffect(() => {
    if (open) {
      setTags(horse.tags.map((t) => ({ category: t.category, label: t.label, note: t.note ?? '' })))
    }
  }, [open, horse])

  const { data: vocabData } = useQuery({
    queryKey: ['tag-vocabulary'],
    queryFn: () => api.get<{ tags: TagOption[] }>('/api/horses/tag-vocabulary'),
    enabled: open,
  })
  const vocabulary = vocabData?.tags ?? []

  function toggleTag(category: TagCategory, label: string) {
    setTags((prev) => {
      const exists = prev.find((t) => t.category === category && t.label === label)
      if (exists) {
        return prev.filter((t) => !(t.category === category && t.label === label))
      }
      return [...prev, { category, label, note: '' }]
    })
  }

  function setTagNote(category: TagCategory, label: string, note: string) {
    setTags((prev) =>
      prev.map((t) => (t.category === category && t.label === label ? { ...t, note } : t))
    )
  }

  const mutation = useMutation({
    mutationFn: () =>
      api.patch(`/api/horses/${horse.id}`, {
        tags: tags.map((t) => ({ category: t.category, label: t.label, note: t.note || null })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horses'] })
      queryClient.invalidateQueries({ queryKey: ['horse', String(horse.id)] })
      queryClient.invalidateQueries({ queryKey: ['tag-vocabulary'] })
      toast.success('התגיות עודכנו בהצלחה')
      onClose()
    },
  })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-background border-border max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-bold">עריכת תגיות — {horse.name}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <TagEditor
            vocabulary={vocabulary}
            tags={tags}
            onToggle={toggleTag}
            onSetNote={setTagNote}
          />

          {mutation.error && (
            <p className="text-destructive mt-4 text-sm">שגיאה: {mutation.error.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            ביטול
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner /> : 'שמור תגיות'}
          </Button>
        </div>
      </div>
    </div>
  )
}
