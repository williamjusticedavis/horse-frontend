import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import type { BadgeVariant } from '@/components/ui/badge'

interface UserRecord {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'user'
  createdAt: string
}

type Role = UserRecord['role']

const roleBadge: Record<Role, { label: string; variant: BadgeVariant }> = {
  super_admin: { label: 'סופר מנהל', variant: 'destructive' },
  admin: { label: 'מנהל', variant: 'warning' },
  user: { label: 'משתמש', variant: 'secondary' },
}

const allRoles: Role[] = ['super_admin', 'admin', 'user']

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: 'super_admin', label: 'סופר מנהל' },
  { value: 'admin', label: 'מנהל' },
  { value: 'user', label: 'משתמש' },
]

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => api.post('/api/auth/register', { email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('המשתמש נוצר')
      setEmail('')
      setPassword('')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!open) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className="bg-background border-border w-full max-w-sm rounded-xl border shadow-xl" dir="rtl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">הוסף משתמש</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-6">
          <Input
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={mutation.isPending}
          />
          <Input
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={mutation.isPending}
          />
          {mutation.error && (
            <p className="text-destructive text-sm">{mutation.error.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            ביטול
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !email || !password}
          >
            {mutation.isPending ? <Spinner /> : 'צור משתמש'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeRoles, setActiveRoles] = useState<Set<Role>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<{ users: UserRecord[] }>('/api/users'),
    enabled: user?.role === 'super_admin',
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch(`/api/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('התפקיד עודכן')
    },
    onError: () => toast.error('שגיאה בעדכון התפקיד'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('המשתמש נמחק')
    },
    onError: () => toast.error('שגיאה במחיקת המשתמש'),
  })

  const allUsers = data?.users ?? []

  const filteredUsers = useMemo(
    () => (activeRoles.size === 0 ? allUsers : allUsers.filter((u) => activeRoles.has(u.role))),
    [activeRoles, allUsers]
  )

  if (!authLoading && user?.role !== 'super_admin') {
    navigate({ to: '/' })
    return null
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-500">
        שגיאה בטעינת המשתמשים
      </div>
    )
  }

  function toggleRole(role: Role) {
    setActiveRoles((prev) => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  function handleDelete(u: UserRecord) {
    if (!confirm(`למחוק את ${u.email}?`)) return
    deleteMutation.mutate(u.id)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">פאנל ניהול משתמשים</h1>
        <Button onClick={() => setCreateOpen(true)}>הוסף משתמש +</Button>
      </div>

      {/* Role filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-bold">סינון לפי תפקיד:</span>
        <div className="flex gap-1.5">
          {allRoles.map((role) => {
            const active = activeRoles.has(role)
            const { label, variant } = roleBadge[role]
            return (
              <button key={role} onClick={() => toggleRole(role)} className="cursor-pointer">
                <Badge
                  variant={active ? variant : 'outline'}
                  className={active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                >
                  {label}
                </Badge>
              </button>
            )
          })}
        </div>
        {activeRoles.size > 0 && (
          <Button variant="link" size="sm" onClick={() => setActiveRoles(new Set())}>
            נקה
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">אימייל</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">תפקיד</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">שינוי תפקיד</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const badge = roleBadge[u.role]
              const isSelf = u.id === user?.id
              return (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      <select
                        className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={u.role}
                        disabled={roleMutation.isPending || deleteMutation.isPending}
                        onChange={(e) =>
                          roleMutation.mutate({ id: u.id, role: e.target.value as Role })
                        }
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u)}
                        disabled={deleteMutation.isPending || roleMutation.isPending}
                        aria-label="מחק משתמש"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center text-sm">
                  לא נמצאו משתמשים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
