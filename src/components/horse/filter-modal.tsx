import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { categoryVariant, categoryLabel, categoryOrder, type TagCategory } from '@/data/horses'

export function HorseFilterModal({
  open,
  onClose,
  filterOptions,
  activeFilters,
  onToggle,
  onClear,
}: {
  open: boolean
  onClose: () => void
  filterOptions: Map<TagCategory, Set<string>>
  activeFilters: Set<string>
  onToggle: (key: string) => void
  onClear: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg"
      title={<h2 className="text-lg font-semibold">סינון</h2>}
    >
      <div className="space-y-4 overflow-y-auto p-6">
        {categoryOrder.map((cat) => {
          const labels = filterOptions.get(cat)
          if (!labels) return null
          return (
            <div key={cat}>
              <p className="text-muted-foreground mb-2 text-xs font-bold">{categoryLabel[cat]}</p>
              <div className="flex flex-wrap gap-1.5">
                {[...labels].map((label) => {
                  const key = `${cat}:${label}`
                  const active = activeFilters.has(key)
                  return (
                    <button key={key} onClick={() => onToggle(key)} className="cursor-pointer">
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
      <div className="border-border flex items-center justify-between border-t p-4">
        <button
          onClick={onClear}
          disabled={activeFilters.size === 0}
          className="text-muted-foreground hover:text-foreground cursor-pointer text-sm underline disabled:pointer-events-none disabled:opacity-40"
        >
          נקה הכל
        </button>
        <Button onClick={onClose}>הצג תוצאות</Button>
      </div>
    </Modal>
  )
}
