import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { categoryVariant, categoryLabel, categoryOrder, type TagCategory } from '@/data/horses'
import type { TagOption, EditTag } from '@/types/horse-edit'

const inputClass =
  'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1'

export function TagEditor({
  vocabulary,
  tags,
  onToggle,
  onSetNote,
}: {
  vocabulary: TagOption[]
  tags: EditTag[]
  onToggle: (category: TagCategory, label: string) => void
  onSetNote: (category: TagCategory, label: string, note: string) => void
}) {
  const [addingFor, setAddingFor] = useState<TagCategory | null>(null)
  const [inputValue, setInputValue] = useState('')

  function commitCustomLabel(cat: TagCategory) {
    const label = inputValue.trim()
    if (label) {
      onToggle(cat, label)
    }
    setInputValue('')
    setAddingFor(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-foreground text-sm font-medium">תגיות</p>
      {categoryOrder.map((cat) => {
        const options = vocabulary.filter((v) => v.category === cat)
        const selected = tags.filter((t) => t.category === cat)
        const isAddingHere = addingFor === cat

        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">{categoryLabel[cat]}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {options.map(({ label }) => {
                const isSelected = selected.some((t) => t.label === label)
                return (
                  <button key={label} onClick={() => onToggle(cat, label)}>
                    <Badge
                      variant={isSelected ? categoryVariant[cat] : 'outline'}
                      className={isSelected ? 'cursor-pointer' : 'cursor-pointer opacity-50 hover:opacity-80'}
                    >
                      {label}
                    </Badge>
                  </button>
                )
              })}
              {isAddingHere ? (
                <input
                  autoFocus
                  className="border-border bg-background text-foreground rounded-md border px-2 py-0.5 text-xs focus:outline-none focus:ring-1"
                  style={{ width: '8rem' }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitCustomLabel(cat) }
                    if (e.key === 'Escape') { setAddingFor(null); setInputValue('') }
                  }}
                  onBlur={() => commitCustomLabel(cat)}
                  placeholder="תגית חדשה..."
                />
              ) : (
                <button
                  onClick={() => { setAddingFor(cat); setInputValue('') }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                >
                  + הוסף
                </button>
              )}
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
                  onChange={(e) => onSetNote(cat, tag.label, e.target.value)}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
