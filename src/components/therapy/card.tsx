import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { domainBorder, domainBadgeVariant, type TherapyCard } from '@/data/therapy'

export function TherapyCardItem({
  card,
  isExpanded,
  onToggle,
  isAdmin,
  onEdit,
  onDelete,
}: {
  card: TherapyCard
  isExpanded: boolean
  onToggle: () => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card
      className={cn(
        'border-t-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
        domainBorder[card.domain]
      )}
    >
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-foreground text-lg font-bold">{card.title}</h3>
          <Badge variant={domainBadgeVariant[card.domain]} className="mt-0.5 shrink-0">
            {card.domain}
          </Badge>
        </div>

        <p className="text-muted-foreground mb-2 text-sm">{card.description}</p>
        <p className="text-foreground text-sm">
          <span className="font-medium">✔ איך הרכיבה עוזרת: </span>
          {card.howItHelps}
        </p>

        {isExpanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                🔧 בפועל
              </p>
              <p className="text-foreground text-sm">{card.inPractice}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                ⚠️ התאמות חשובות
              </p>
              <p className="text-foreground text-sm">{card.contraindications}</p>
            </div>
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {card.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={onEdit}>
                  עריכה
                </Button>
                <Button size="sm" variant="destructive" onClick={onDelete}>
                  מחיקה
                </Button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 text-sm transition-colors"
        >
          {isExpanded ? 'פחות פרטים ▲' : 'פרטים נוספים ▼'}
        </button>
      </CardContent>
    </Card>
  )
}
