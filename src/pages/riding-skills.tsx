import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { SkillCard } from '@/components/skills/skill-card'
import { CATEGORIES, type Skill, type Category } from '@/data/skills'

export function RidingSkillsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<{ skills: Skill[] }>('/api/skills'),
  })

  const skills = useMemo(() => data?.skills ?? [], [data])

  const byCategory = useMemo(() => {
    const map = new Map<Category, Skill[]>()
    for (const cat of CATEGORIES) map.set(cat, [])
    for (const skill of skills) {
      const list = map.get(skill.category as Category)
      if (list) list.push(skill)
    }
    return map
  }, [skills])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">שגיאה בטעינת הכישורים</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">כישורי רכיבה</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            מדריך עזר למדריכים לבניית תכניות רכיבה לתלמידים
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/riding-skills/new">
              <Plus className="h-4 w-4" />
              הוסף כישור
            </Link>
          </Button>
        )}
      </div>

      {/* Categories */}
      {skills.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">אין כישורים עדיין</p>
      ) : (
        <div className="space-y-10">
          {CATEGORIES.map((category) => {
            const categorySkills = byCategory.get(category) ?? []
            if (categorySkills.length === 0) return null
            return (
              <section key={category}>
                <h2 className="text-foreground mb-4 flex items-baseline gap-2 border-b pb-2 text-xl font-semibold">
                  {category}
                  <span className="text-muted-foreground text-sm font-normal">
                    {categorySkills.length}
                  </span>
                </h2>
                {/* flex-wrap (not grid) so a partial last row centers instead of
                  leaving a hole on one side */}
                <div className="flex flex-wrap justify-center gap-5">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
                    >
                      <SkillCard skill={skill} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
