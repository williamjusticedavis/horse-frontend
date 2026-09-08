import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { domainBadgeVariant, type TherapyCard } from '@/data/therapy'

export function TherapyDetailModal({
  card,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}: {
  card: TherapyCard | null
  onClose: () => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  if (!card) return null

  const sections = [
    { label: 'איך הרכיבה עוזרת', body: card.howItHelps },
    { label: '🔧 בפועל', body: card.inPractice },
    { label: '⚠️ התאמות חשובות', body: card.contraindications },
  ]

  return (
    <Modal
      open
      onClose={onClose}
      className="max-w-xl"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">{card.title}</h2>
          <Badge variant={domainBadgeVariant[card.domain]}>{card.domain}</Badge>
        </div>
      }
    >
      <div className="space-y-4 overflow-y-auto p-6">
        <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>

        {sections.map(({ label, body }) => (
          <div key={label}>
            <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
              {label}
            </p>
            <p className="text-foreground text-sm leading-relaxed">{body}</p>
          </div>
        ))}

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
          <div className="border-border flex gap-2 border-t pt-4">
            <Button size="sm" variant="outline" onClick={onEdit}>
              עריכה
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              מחיקה
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
