import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { DOMAINS, domainBadgeVariant, type Domain } from '@/data/therapy'

export function TherapyFilterModal({
  open,
  onClose,
  availableTags,
  activeDomains,
  activeTags,
  onToggleDomain,
  onToggleTag,
  onClear,
}: {
  open: boolean
  onClose: () => void
  availableTags: string[]
  activeDomains: Set<Domain>
  activeTags: Set<string>
  onToggleDomain: (domain: Domain) => void
  onToggleTag: (tag: string) => void
  onClear: () => void
}) {
  const hasActive = activeDomains.size > 0 || activeTags.size > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg"
      title={<h2 className="text-lg font-semibold">סינון</h2>}
    >
      <div className="space-y-4 overflow-y-auto p-6">
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-bold">תחום</p>
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((d) => (
              <button key={d} onClick={() => onToggleDomain(d)} className="cursor-pointer">
                <Badge
                  variant={activeDomains.has(d) ? domainBadgeVariant[d] : 'outline'}
                  className={activeDomains.has(d) ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                >
                  {d}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {availableTags.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-bold">תגיות</p>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button key={tag} onClick={() => onToggleTag(tag)} className="cursor-pointer">
                  <Badge
                    variant={activeTags.has(tag) ? 'teal' : 'outline'}
                    className={activeTags.has(tag) ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                  >
                    #{tag}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-border flex items-center justify-between border-t p-4">
        <button
          onClick={onClear}
          disabled={!hasActive}
          className="text-muted-foreground hover:text-foreground cursor-pointer text-sm underline disabled:pointer-events-none disabled:opacity-40"
        >
          נקה הכל
        </button>
        <Button onClick={onClose}>הצג תוצאות</Button>
      </div>
    </Modal>
  )
}
