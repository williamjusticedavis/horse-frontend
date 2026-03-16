import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categoryVariant, categoryOrder, type Horse } from '@/data/horses'

export function HorseCard({ horse, onEditTags }: { horse: Horse; onEditTags?: () => void }) {
  return (
    <Link key={horse.id} to="/horse/$id" params={{ id: String(horse.id) }} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="bg-muted flex h-48 items-center justify-center">
          <span className="text-6xl">{horse.imageEmoji ?? '🐴'}</span>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{horse.name}</CardTitle>
          <p className="text-muted-foreground text-sm">גיל: {horse.age}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">{horse.description}</p>
          <div className="flex flex-wrap gap-1">
            {categoryOrder.flatMap((cat) =>
              horse.tags
                .filter((t) => t.category === cat)
                .map((tag) => (
                  <Badge key={tag.id} variant={categoryVariant[tag.category]}>
                    {tag.label}
                  </Badge>
                ))
            )}
          </div>
          {onEditTags && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEditTags()
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            >
              ✏️ תגיות
            </button>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
