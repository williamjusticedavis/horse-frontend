import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { TherapyCardItem } from '@/components/therapy/card'
import { TherapyDetailModal } from '@/components/therapy/detail-modal'
import { TherapyFilterModal } from '@/components/therapy/filter-modal'
import { CardModal } from '@/components/therapy/card-modal'
import {
  TAG_VOCABULARY,
  domainBadgeVariant,
  type Domain,
  type TherapyCard,
  type CardFormData,
} from '@/data/therapy'

export function TherapyPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const queryClient = useQueryClient()

  const [activeDomains, setActiveDomains] = useState<Set<Domain>>(new Set())
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [detailCard, setDetailCard] = useState<TherapyCard | null>(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
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
    setDetailCard(null)
    deleteMutation.mutate(card.id)
  }

  return (
    <div dir="rtl" className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-bold">רכיבה טיפולית – התאמה אישית לכל ילד</h1>
        {isAdmin && <Button onClick={() => setShowCreate(true)}>+ כרטיסיה חדשה</Button>}
      </div>

      {/* Filter bar — a single trigger opens the full picker (see filter-modal.tsx)
          instead of dumping domain + tag rows straight onto the page. */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          סינון
          {(activeDomains.size > 0 || activeTags.size > 0) && (
            <Badge variant="default" className="ms-1">
              {activeDomains.size + activeTags.size}
            </Badge>
          )}
        </Button>
        {[...activeDomains].map((d) => (
          <button key={d} onClick={() => toggleDomain(d)} className="cursor-pointer">
            <Badge variant={domainBadgeVariant[d]} className="gap-1 pe-1.5">
              {d}
              <X className="h-3 w-3" />
            </Badge>
          </button>
        ))}
        {[...activeTags].map((tag) => (
          <button key={tag} onClick={() => toggleTag(tag)} className="cursor-pointer">
            <Badge variant="teal" className="gap-1 pe-1.5">
              #{tag}
              <X className="h-3 w-3" />
            </Badge>
          </button>
        ))}
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
            // flex-wrap (not grid) so a partial last row centers instead of
            // leaving a hole on one side
            <div className="flex flex-wrap justify-center gap-5">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
                >
                  <TherapyCardItem card={card} onOpen={() => setDetailCard(card)} />
                </div>
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
      <TherapyFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        availableTags={availableTags}
        activeDomains={activeDomains}
        activeTags={activeTags}
        onToggleDomain={toggleDomain}
        onToggleTag={toggleTag}
        onClear={() => {
          setActiveDomains(new Set())
          setActiveTags(new Set())
        }}
      />
      <TherapyDetailModal
        card={detailCard}
        onClose={() => setDetailCard(null)}
        isAdmin={isAdmin}
        onEdit={() => {
          const card = detailCard
          setDetailCard(null)
          setEditingCard(card)
        }}
        onDelete={() => detailCard && handleDelete(detailCard)}
      />
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
