import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ApiError } from '@/lib/query-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success('ברוך השב!')
      navigate({ to: '/' })
    },
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const next: typeof fieldErrors = {}
    if (!form.email) next.email = 'נדרשת כתובת אימייל'
    if (!form.password) next.password = 'נדרשת סיסמה'
    if (Object.keys(next).length) {
      setFieldErrors(next)
      return
    }

    setFieldErrors({})
    mutation.mutate(form)
  }

  const serverError =
    mutation.error instanceof ApiError && mutation.error.status === 401
      ? 'אימייל או סיסמה שגויים'
      : mutation.error
        ? 'משהו השתבש. נסה שנית.'
        : null

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader dir="rtl">
          <CardTitle>כניסה לחשבון</CardTitle>
          <CardDescription>הכנס את פרטי הכניסה שלך</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="flex flex-col gap-4" dir="rtl">
            {serverError && <p className="text-destructive text-sm">{serverError}</p>}

            <Input
              label="אימייל"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={fieldErrors.email}
            />

            <Input
              label="סיסמה"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={fieldErrors.password}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3" dir="rtl">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'מתחבר…' : 'כניסה'}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              אין לך חשבון?{' '}
              <Link to="/register" className="text-foreground underline underline-offset-4">
                הירשם
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
