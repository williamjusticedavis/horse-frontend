import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categoryVariant, categoryOrder, type Horse } from '@/data/horses'

export function HorseCard({
  horse,
  onEditTags,
  onDelete,
}: {
  horse: Horse
  onEditTags?: () => void
  onDelete?: () => void
}) {
  return (
    <Link key={horse.id} to="/horse/$id" params={{ id: String(horse.id) }} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="bg-muted flex h-48 items-center justify-center">
          {horse.imageUrl ? (
            <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">🐴</span>
              <span className="text-foreground text-sm font-medium">{horse.name}</span>
            </div>
          )}
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
          {(onEditTags || onDelete) && (
            <div className="flex gap-3">
              {onEditTags && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEditTags()
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointertext-xs"
                >
                  ✏️ תגיות
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="cursor-pointer text-xs text-red-400 hover:text-red-600"
                >
                  🗑️ מחק
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
