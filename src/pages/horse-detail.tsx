import { useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { categoryVariant, categoryLabel, categoryOrder, type Horse } from '@/data/horses'
import { Route } from '@/routes/horse.$id'

export function HorseDetailPage() {
  const { id } = Route.useParams()
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['horse', id],
    queryFn: () => api.get<{ horse: Horse }>(`/api/horses/${id}`),
  })

  const horse = data?.horse

  return (
    <div className="mx-auto max-w-2xl space-y-8" dir="rtl">
      {/* Back button */}
      <button
        onClick={() => router.history.back()}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
      >
        <span>→</span>
        <span>חזרה לרשימת הסוסים</span>
      </button>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && <p className="text-destructive text-center">שגיאה בטעינת פרטי הסוס.</p>}

      {horse && (
        <>
          {/* Horse image */}
          <div className="bg-muted flex h-64 items-center justify-center rounded-xl">
            <span className="text-8xl">{horse.imageEmoji ?? '🐴'}</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-foreground text-4xl font-bold">{horse.name}</h1>
            <p className="text-muted-foreground">גיל: {horse.age}</p>
          </div>

          {/* Tags with notes */}
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
                        {tag.note && (
                          <span className="text-muted-foreground text-sm">{tag.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Metadata */}
          {(horse.breed || horse.color) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {horse.breed && (
                <div>
                  <span className="text-muted-foreground font-medium">גזע: </span>
                  <span className="text-foreground">{horse.breed}</span>
                </div>
              )}
              {horse.color && (
                <div>
                  <span className="text-muted-foreground font-medium">צבע: </span>
                  <span className="text-foreground">{horse.color}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-foreground leading-relaxed">
            {horse.fullDescription ?? horse.description}
          </p>
        </>
      )}
    </div>
  )
}
