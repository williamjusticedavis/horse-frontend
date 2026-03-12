import { Badge } from '@/components/ui/badge'
import { categoryVariant, categoryLabel, categoryOrder, type HorseTag } from '@/data/horses'

export function TagDisplay({ tags }: { tags: HorseTag[] }) {
  return (
    <div className="space-y-3">
      {categoryOrder.map((cat) => {
        const catTags = tags.filter((t) => t.category === cat)
        if (catTags.length === 0) return null
        return (
          <div key={cat} className="flex items-start gap-3">
            <span className="text-muted-foreground mt-0.5 w-12 shrink-0 text-xs font-medium">
              {categoryLabel[cat]}:
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {catTags.map((tag) => (
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
  )
}
