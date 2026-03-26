import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { TherapyCardItem } from '@/components/therapy/card'
import { CardModal } from '@/components/therapy/card-modal'
import {
  DOMAINS,
  TAG_VOCABULARY,
  domainBadgeVariant,
  type Domain,
  type TherapyCard,
  type CardFormData,
} from '@/data/therapy'

export function TherapyPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const queryClient = useQueryClient()

  const [activeDomains, setActiveDomains] = useState<Set<Domain>>(new Set())
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingCard, setEditingCard] = useState<TherapyCard | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['therapy-cards'],
    queryFn: () => api.get<{ cards: TherapyCard[] }>('/api/therapy-cards'),
  })

  const cards = useMemo(() => data?.cards ?? [], [data])

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const card of cards) card.tags.forEach((t) => tagSet.add(t))
    const vocabFirst = (TAG_VOCABULARY as readonly string[]).filter((t) => tagSet.has(t))
    const custom = [...tagSet].filter((t) => !(TAG_VOCABULARY as readonly string[]).includes(t))
    return [...vocabFirst, ...custom]
  }, [cards])

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (activeDomains.size > 0 && !activeDomains.has(c.domain as Domain)) return false
      if (activeTags.size > 0 && !c.tags.some((t) => activeTags.has(t))) return false
      return true
    })
  }, [cards, activeDomains, activeTags])

  function toggleDomain(domain: Domain) {
    setActiveDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const createMutation = useMutation({
    mutationFn: (body: object) => api.post<{ card: TherapyCard }>('/api/therapy-cards', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapy-cards'] })
      toast.success('הכרטיסיה נוצרה')
      setShowCreate(false)
    },
    onError: () => toast.error('שגיאה ביצירת הכרטיסיה'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      api.patch<{ card: TherapyCard }>(`/api/therapy-cards/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapy-cards'] })
      toast.success('הכרטיסיה עודכנה')
      setEditingCard(null)
    },
    onError: () => toast.error('שגיאה בעדכון הכרטיסיה'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/therapy-cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapy-cards'] })
      toast.success('הכרטיסיה נמחקה')
    },
    onError: () => toast.error('שגיאה במחיקת הכרטיסיה'),
  })

  function handleCardSubmit(formData: CardFormData) {
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, body: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  function handleDelete(card: TherapyCard) {
    if (!confirm(`למחוק את "${card.title}"?`)) return
    deleteMutation.mutate(card.id)
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div dir="rtl" className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-bold">רכיבה טיפולית – התאמה אישית לכל ילד</h1>
        {isAdmin && <Button onClick={() => setShowCreate(true)}>+ כרטיסיה חדשה</Button>}
      </div>

      {/* Filter bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-bold">תחום:</span>
          {DOMAINS.map((d) => (
            <button key={d} onClick={() => toggleDomain(d)} className="cursor-pointer">
              <Badge
                variant={activeDomains.has(d) ? domainBadgeVariant[d] : 'outline'}
                className={activeDomains.has(d) ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
              >
                {d}
              </Badge>
            </button>
          ))}
        </div>
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-bold">תגיות:</span>
            {availableTags.map((tag) => (
              <button key={tag} onClick={() => toggleTag(tag)} className="cursor-pointer">
                <Badge
                  variant={activeTags.has(tag) ? 'teal' : 'outline'}
                  className={activeTags.has(tag) ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                >
                  #{tag}
                </Badge>
              </button>
            ))}
          </div>
        )}
        {(activeDomains.size > 0 || activeTags.size > 0) && (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setActiveDomains(new Set())
              setActiveTags(new Set())
            }}
          >
            נקה הכל
          </Button>
        )}
      </div>

      {/* Cards */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {isError && (
        <p className="text-destructive text-center">שגיאה בטעינת הנתונים. נסו שוב מאוחר יותר.</p>
      )}
      {!isLoading && !isError && (
        <>
          {filteredCards.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              {cards.length === 0 ? 'אין כרטיסיות עדיין' : 'לא נמצאו כרטיסיות לסינון זה'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => (
                <TherapyCardItem
                  key={card.id}
                  card={card}
                  isExpanded={expandedId === card.id}
                  onToggle={() => toggleExpand(card.id)}
                  isAdmin={isAdmin}
                  onEdit={() => setEditingCard(card)}
                  onDelete={() => handleDelete(card)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Trust block */}
      <section className="border-border rounded-xl border p-8 text-center">
        <h2 className="text-foreground mb-3 text-xl font-bold">התאמה אישית ובטיחות</h2>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm">
          ההתאמה הטיפולית נעשית באופן אישי לאחר היכרות עם המטופל ובהתאם לשיקולים מקצועיים
          ובטיחותיים.
        </p>
      </section>

      {/* Modals */}
      <CardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCardSubmit}
        isPending={createMutation.isPending}
      />
      <CardModal
        key={editingCard?.id ?? 'edit'}
        open={editingCard !== null}
        onClose={() => setEditingCard(null)}
        initial={editingCard ?? undefined}
        onSubmit={handleCardSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  )
}
