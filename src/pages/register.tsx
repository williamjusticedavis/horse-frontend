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

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      register(email, password),
    onSuccess: () => {
      toast.success('החשבון נוצר בהצלחה!')
      navigate({ to: '/' })
    },
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const next: typeof fieldErrors = {}
    if (!form.email) next.email = 'נדרשת כתובת אימייל'
    if (!form.password) next.password = 'נדרשת סיסמה'
    else if (form.password.length < 8) next.password = 'הסיסמה חייבת להכיל לפחות 8 תווים'
    if (Object.keys(next).length) {
      setFieldErrors(next)
      return
    }

    setFieldErrors({})
    mutation.mutate(form)
  }

  const emailError =
    fieldErrors.email ??
    (mutation.error instanceof ApiError && mutation.error.status === 409
      ? 'כבר קיים חשבון עם כתובת אימייל זו'
      : undefined)

  const serverError =
    mutation.error && !(mutation.error instanceof ApiError && mutation.error.status === 409)
      ? 'משהו השתבש. נסה שנית.'
      : null

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader dir="rtl">
          <CardTitle>יצירת חשבון</CardTitle>
          <CardDescription>הירשם כדי להתחיל</CardDescription>
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
              error={emailError}
            />

            <Input
              label="סיסמה"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              hint="לפחות 8 תווים"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={fieldErrors.password}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3" dir="rtl">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'יוצר חשבון…' : 'יצירת חשבון'}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              כבר יש לך חשבון?{' '}
              <Link to="/login" className="text-foreground underline underline-offset-4">
                כניסה
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
