import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import {
  type Skill,
  type Level,
  LEVELS,
  levelLabel,
  levelBadgeVariant,
  levelTabActive,
  levelTabInactive,
  levelSectionBorder,
} from '@/data/skills'
import { Route } from '@/routes/riding-skills.$id.index'

export function SkillDetailPage() {
  const { id } = Route.useParams()
  const { level } = Route.useSearch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['skills', id],
    queryFn: () => api.get<{ skill: Skill }>(`/api/skills/${id}`),
  })

  // Load all skills for prerequisite name resolution (uses shared cache)
  const { data: allSkillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<{ skills: Skill[] }>('/api/skills'),
  })
  const skillsById = useMemo(() => {
    const map = new Map<string, Skill>()
    for (const s of allSkillsData?.skills ?? []) map.set(s.id, s)
    return map
  }, [allSkillsData])

  const skill = data?.skill

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !skill) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">שגיאה בטעינת הכישור</p>
      </div>
    )
  }

  const currentLevelData = skill.levels.find((l) => l.level === level)

  function setLevel(l: Level) {
    void navigate({ to: '/riding-skills/$id', params: { id }, search: { level: l } })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      {/* Back */}
      <Link
        to="/riding-skills"
        className="text-muted-foreground mb-6 flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        חזרה לכישורי רכיבה
      </Link>

      {/* Title + Edit */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">{skill.name}</h1>
        {isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link to="/riding-skills/$id/edit" params={{ id }}>
              <Pencil className="h-4 w-4" />
              עריכה
            </Link>
          </Button>
        )}
      </div>

      {/* Level Tabs */}
      <div className="mb-6 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${level === l ? levelTabActive[l] : levelTabInactive}`}
          >
            {levelLabel[l]}
          </button>
        ))}
      </div>

      {/* Shared descriptions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-foreground mb-3 leading-relaxed font-medium">
            {skill.shortDescription}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">{skill.longDescription}</p>
        </CardContent>
      </Card>

      {/* Level-specific content */}
      {currentLevelData ? (
        <div
          className={`border-r-4 ${levelSectionBorder[level]} bg-card rounded-lg rounded-r-none border p-6`}
        >
          <h2 className="text-foreground mb-3 text-lg font-semibold">רמה: {levelLabel[level]}</h2>
          <p className="text-foreground mb-6 leading-relaxed">{currentLevelData.description}</p>

          {/* Prerequisites */}
          {currentLevelData.prerequisites.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                דרישות מקדימות
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentLevelData.prerequisites.map((p, i) => (
                  <PrerequisiteChip
                    key={i}
                    skillId={p.skillId}
                    level={p.level as Level}
                    skillName={skillsById.get(p.skillId)?.name}
                  />
                ))}
              </div>
            </div>
          )}

          {currentLevelData.prerequisites.length === 0 && (
            <p className="text-muted-foreground text-sm">אין דרישות מקדימות לרמה זו</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">אין מידע לרמה זו</p>
      )}
    </div>
  )
}

function PrerequisiteChip({
  skillId,
  level,
  skillName,
}: {
  skillId: string
  level: Level
  skillName?: string
}) {
  return (
    <Link
      to="/riding-skills/$id"
      params={{ id: skillId }}
      search={{ level }}
      target="_blank"
      className="hover:bg-accent inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors"
    >
      <span className="font-medium">{skillName ?? '...'}</span>
      <Badge variant={levelBadgeVariant[level]} className="mr-1 text-xs">
        {levelLabel[level]}
      </Badge>
    </Link>
  )
}
