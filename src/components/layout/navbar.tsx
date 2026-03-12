import { Link } from '@tanstack/react-router'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/theme-context'
import { useAuth } from '@/context/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navLinks = [
  { to: '/', label: 'סוסים' },
  { to: '/riding-skills', label: 'כישורי רכיבה' },
  { to: '/therapy', label: 'טיפול' },
] as const

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Brand */}
        <Link to="/" className="text-foreground flex items-center gap-2 text-lg font-semibold">
          <span>🐴</span>
          <span>סוס</span>
        </Link>

        {/* Links */}
        <ul className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  'text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  '[&.active]:bg-accent [&.active]:text-accent-foreground'
                )}
                activeProps={{ className: 'active' }}
                activeOptions={{ exact: to === '/' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: auth + theme toggle */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-1.5 sm:flex">
                {user?.role === 'admin' && <Badge variant="warning">מנהל</Badge>}
                <span className="text-muted-foreground text-sm">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout().then(() => toast.success('התנתקת בהצלחה'))}
                aria-label="התנתק"
                title="התנתק"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  כניסה
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">הרשמה</Button>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`עבור למצב ${resolvedTheme === 'dark' ? 'בהיר' : 'כהה'}`}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </nav>
    </header>
  )
}
