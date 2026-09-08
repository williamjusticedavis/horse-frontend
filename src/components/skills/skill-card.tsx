import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { type Skill, LEVELS, levelDot } from '@/data/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  // Dots reflect the levels this skill actually defines, in beginner→advanced order
  const availableLevels = LEVELS.filter((l) => skill.levels.some((sl) => sl.level === l))

  return (
    <Link
      to="/riding-skills/$id"
      params={{ id: skill.id }}
      search={{ level: 'beginner' }}
      className="focus-visible:ring-ring group block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Card className="hover:border-primary/40 flex h-full flex-col transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">{skill.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {skill.shortDescription}
          </p>
          <div className="text-muted-foreground mt-auto flex items-center justify-between pt-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="flex gap-1">
                {availableLevels.map((l) => (
                  <span key={l} className={`h-1.5 w-1.5 rounded-full ${levelDot[l]}`} />
                ))}
              </span>
              {availableLevels.length} רמות
            </span>
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
