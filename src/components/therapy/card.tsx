import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { domainBorder, domainBadgeVariant, type TherapyCard } from '@/data/therapy'

export function TherapyCardItem({ card, onOpen }: { card: TherapyCard; onOpen: () => void }) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'focus-visible:ring-ring group flex h-full cursor-pointer flex-col border-t-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        domainBorder[card.domain]
      )}
    >
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-foreground line-clamp-2 text-lg leading-snug font-bold">
            {card.title}
          </h3>
          <Badge variant={domainBadgeVariant[card.domain]} className="mt-0.5 shrink-0">
            {card.domain}
          </Badge>
        </div>

        <p className="text-muted-foreground line-clamp-3 text-sm">{card.description}</p>
        <p className="text-foreground mt-2 line-clamp-2 text-sm">
          <span className="font-medium">איך הרכיבה עוזרת: </span>
          {card.howItHelps}
        </p>

        <div className="text-muted-foreground group-hover:text-foreground mt-auto flex items-center gap-1 pt-4 text-sm transition-colors">
          פרטים נוספים
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
      </CardContent>
    </Card>
  )
}
