import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Skill, levelLabel, levelBadgeVariant, LEVELS } from '@/data/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link to="/riding-skills/$id" params={{ id: skill.id }} search={{ level: 'beginner' }}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{skill.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
            {skill.shortDescription}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((l) => (
              <Badge key={l} variant={levelBadgeVariant[l]}>
                {levelLabel[l]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
