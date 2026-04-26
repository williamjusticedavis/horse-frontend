import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus, X, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import {
  type Skill,
  type Level,
  type SkillFormData,
  CATEGORIES,
  LEVELS,
  levelLabel,
  levelSectionBorder,
  emptySkillForm,
  skillToForm,
  skillFormSchema,
} from '@/data/skills'

interface SkillFormPageProps {
  skillId?: string // present when editing
}

export function SkillFormPage({ skillId }: SkillFormPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!skillId

  // Fetch existing skill when editing
  const { data: existingData, isLoading: loadingSkill } = useQuery({
    queryKey: ['skills', skillId],
    queryFn: () => api.get<{ skill: Skill }>(`/api/skills/${skillId}`),
    enabled: isEdit,
  })

  // All skills for the prerequisite selector
  const { data: allSkillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<{ skills: Skill[] }>('/api/skills'),
  })
  const otherSkills = useMemo(
    () => (allSkillsData?.skills ?? []).filter((s) => s.id !== skillId),
    [allSkillsData, skillId]
  )

  // Form state - initialised once skill loads (or empty for create)
  const [form, setForm] = useState<SkillFormData>(() => emptySkillForm())
  const [formReady, setFormReady] = useState(!isEdit)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form once existing skill is loaded
  if (isEdit && existingData?.skill && !formReady) {
    setForm(skillToForm(existingData.skill))
    setFormReady(true)
  }

  const saveMutation = useMutation({
    mutationFn: (body: SkillFormData) =>
      isEdit
        ? api.patch<{ skill: Skill }>(`/api/skills/${skillId}`, body)
        : api.post<{ skill: Skill }>('/api/skills', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success(isEdit ? 'הכישור עודכן' : 'הכישור נוצר')
      void navigate({ to: '/riding-skills' })
    },
    onError: () => toast.error(isEdit ? 'שגיאה בעדכון הכישור' : 'שגיאה ביצירת הכישור'),
  })

  function setField<K extends keyof SkillFormData>(key: K, value: SkillFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function setLevelField(levelIdx: number, field: 'description', value: string) {
    setForm((prev) => {
      const levels = [...prev.levels]
      levels[levelIdx] = { ...levels[levelIdx], [field]: value }
      return { ...prev, levels }
    })
  }

  function addPrerequisite(levelIdx: number) {
    setForm((prev) => {
      const levels = [...prev.levels]
      const prereqs = [
        ...levels[levelIdx].prerequisites,
        { skillId: '', level: 'beginner' as Level },
      ]
      levels[levelIdx] = { ...levels[levelIdx], prerequisites: prereqs }
      return { ...prev, levels }
    })
  }

  function removePrerequisite(levelIdx: number, prereqIdx: number) {
    setForm((prev) => {
      const levels = [...prev.levels]
      const prereqs = levels[levelIdx].prerequisites.filter((_, i) => i !== prereqIdx)
      levels[levelIdx] = { ...levels[levelIdx], prerequisites: prereqs }
      return { ...prev, levels }
    })
  }

  function setPrerequisite(
    levelIdx: number,
    prereqIdx: number,
    field: 'skillId' | 'level',
    value: string
  ) {
    setForm((prev) => {
      const levels = [...prev.levels]
      const prereqs = [...levels[levelIdx].prerequisites]
      prereqs[prereqIdx] = { ...prereqs[prereqIdx], [field]: value }
      levels[levelIdx] = { ...levels[levelIdx], prerequisites: prereqs }
      return { ...prev, levels }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = skillFormSchema.safeParse(form)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path.join('.')
        newErrors[key] = issue.message
      }
      setErrors(newErrors)
      toast.error('יש לתקן את השגיאות בטופס')
      return
    }
    saveMutation.mutate(result.data)
  }

  if (isEdit && loadingSkill) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
      {/* Back */}
      <Link
        to="/riding-skills"
        className="text-muted-foreground mb-6 flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        חזרה לכישורי רכיבה
      </Link>

      <h1 className="text-foreground mb-8 text-2xl font-bold">
        {isEdit ? 'עריכת כישור' : 'כישור חדש'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-foreground text-sm font-medium">שם הכישור (אנגלית)</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Half-Halt"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-foreground text-sm font-medium">קטגוריה</label>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value as SkillFormData['category'])}
            className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Short description */}
        <div className="space-y-1">
          <label className="text-foreground text-sm font-medium">תיאור קצר</label>
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => setField('shortDescription', e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          {errors.shortDescription && (
            <p className="text-destructive text-xs">{errors.shortDescription}</p>
          )}
        </div>

        {/* Long description */}
        <div className="space-y-1">
          <label className="text-foreground text-sm font-medium">תיאור מפורט</label>
          <textarea
            rows={4}
            value={form.longDescription}
            onChange={(e) => setField('longDescription', e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          {errors.longDescription && (
            <p className="text-destructive text-xs">{errors.longDescription}</p>
          )}
        </div>

        {/* Level sections */}
        {LEVELS.map((levelKey, levelIdx) => (
          <LevelSection
            key={levelKey}
            levelKey={levelKey}
            levelIdx={levelIdx}
            description={form.levels[levelIdx]?.description ?? ''}
            prerequisites={form.levels[levelIdx]?.prerequisites ?? []}
            otherSkills={otherSkills}
            errors={errors}
            onDescriptionChange={(val) => setLevelField(levelIdx, 'description', val)}
            onAddPrerequisite={() => addPrerequisite(levelIdx)}
            onRemovePrerequisite={(pi) => removePrerequisite(levelIdx, pi)}
            onSetPrerequisite={(pi, field, val) => setPrerequisite(levelIdx, pi, field, val)}
          />
        ))}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/riding-skills">ביטול</Link>
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Spinner size="sm" /> : isEdit ? 'שמור שינויים' : 'צור כישור'}
          </Button>
        </div>
      </form>
    </div>
  )
}

interface LevelSectionProps {
  levelKey: Level
  levelIdx: number
  description: string
  prerequisites: { skillId: string; level: Level }[]
  otherSkills: Skill[]
  errors: Record<string, string>
  onDescriptionChange: (val: string) => void
  onAddPrerequisite: () => void
  onRemovePrerequisite: (idx: number) => void
  onSetPrerequisite: (idx: number, field: 'skillId' | 'level', val: string) => void
}

function LevelSection({
  levelKey,
  levelIdx,
  description,
  prerequisites,
  otherSkills,
  errors,
  onDescriptionChange,
  onAddPrerequisite,
  onRemovePrerequisite,
  onSetPrerequisite,
}: LevelSectionProps) {
  const descKey = `levels.${levelIdx}.description`

  return (
    <div
      className={`border-r-4 ${levelSectionBorder[levelKey]} bg-card rounded-lg rounded-r-none border p-5`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Badge
          variant={
            levelKey === 'beginner'
              ? 'success'
              : levelKey === 'intermediate'
                ? 'warning'
                : 'destructive'
          }
        >
          {levelLabel[levelKey]}
        </Badge>
        <span className="text-muted-foreground text-sm">— תיאור רמה ודרישות מקדימות</span>
      </div>

      {/* Level description */}
      <div className="mb-4 space-y-1">
        <label className="text-foreground text-sm font-medium">תיאור הרמה</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        {errors[descKey] && <p className="text-destructive text-xs">{errors[descKey]}</p>}
      </div>

      {/* Prerequisites */}
      <div className="space-y-2">
        <label className="text-foreground text-sm font-medium">דרישות מקדימות</label>

        {prerequisites.map((p, pi) => (
          <div key={pi} className="flex items-center gap-2">
            <select
              value={p.skillId}
              onChange={(e) => onSetPrerequisite(pi, 'skillId', e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring min-w-0 flex-1 rounded-md border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">— בחר כישור —</option>
              {otherSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={p.level}
              onChange={(e) => onSetPrerequisite(pi, 'level', e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {levelLabel[l]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemovePrerequisite(pi)}
              className="text-muted-foreground hover:text-destructive shrink-0"
              aria-label="הסר"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddPrerequisite}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          הוסף דרישה מקדימה
        </button>
      </div>
    </div>
  )
}
