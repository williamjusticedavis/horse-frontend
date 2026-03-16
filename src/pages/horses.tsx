import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import {
  categoryVariant,
  categoryLabel,
  categoryOrder,
  type Horse,
  type TagCategory,
} from '@/data/horses'
import { HorseCard } from '@/components/horse/card'
import { CreateHorseModal } from '@/components/horse/create-horse-modal'
import { EditTagsModal } from '@/components/horse/edit-tags-modal'

function buildFilterOptions(horses: Horse[]) {
  const map = new Map<TagCategory, Set<string>>()
  for (const horse of horses) {
    for (const tag of horse.tags) {
      if (!map.has(tag.category)) map.set(tag.category, new Set())
      map.get(tag.category)!.add(tag.label)
    }
  }
  return map
}

export function HorsesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [editTagsHorseId, setEditTagsHorseId] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['horses'],
    queryFn: () => api.get<{ horses: Horse[] }>('/api/horses'),
  })

  const horses = useMemo(() => data?.horses ?? [], [data])
  const filterOptions = useMemo(() => buildFilterOptions(horses), [horses])

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const filteredHorses = useMemo(() => {
    if (activeFilters.size === 0) return horses
    const byCategory = new Map<TagCategory, Set<string>>()
    for (const key of activeFilters) {
      const [cat, label] = key.split(':') as [TagCategory, string]
      if (!byCategory.has(cat)) byCategory.set(cat, new Set())
      byCategory.get(cat)!.add(label)
    }
    return horses.filter((horse) => {
      for (const [cat, labels] of byCategory) {
        const horseTags = horse.tags.filter((t) => t.category === cat).map((t) => t.label)
        if (!horseTags.some((l) => labels.has(l))) return false
      }
      return true
    })
  }, [activeFilters, horses])

  const editTagsHorse =
    editTagsHorseId !== null ? horses.find((h) => h.id === editTagsHorseId) : null

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-bold">הסוסים שלנו</h1>
        {isAdmin && <Button onClick={() => setCreateOpen(true)}>הוסף סוס +</Button>}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-destructive text-center">שגיאה בטעינת הסוסים. נסו שוב מאוחר יותר.</p>
      )}

      {!isLoading && !isError && (
        <>
          {/* Filter bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              {categoryOrder.map((cat) => {
                const labels = filterOptions.get(cat)
                if (!labels) return null
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-bold">
                      {categoryLabel[cat]}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[...labels].map((label) => {
                        const key = `${cat}:${label}`
                        const active = activeFilters.has(key)
                        return (
                          <button
                            key={key}
                            onClick={() => toggleFilter(key)}
                            className="cursor-pointer"
                          >
                            <Badge
                              variant={active ? categoryVariant[cat] : 'outline'}
                              className={active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                            >
                              {label}
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {activeFilters.size > 0 && (
              <Button variant="link" size="sm" onClick={() => setActiveFilters(new Set())}>
                נקה הכל
              </Button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHorses.map((horse) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                onEditTags={isAdmin ? () => setEditTagsHorseId(horse.id) : undefined}
              />
            ))}
          </div>

          {filteredHorses.length === 0 && horses.length > 0 && (
            <p className="text-muted-foreground text-center">לא נמצאו סוסים התואמים את הסינון</p>
          )}
        </>
      )}

      <CreateHorseModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {editTagsHorse && (
        <EditTagsModal
          horse={editTagsHorse}
          open={editTagsHorseId !== null}
          onClose={() => setEditTagsHorseId(null)}
        />
      )}
    </div>
  )
}
