import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
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

const linkClass = cn(
  'text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
  '[&.active]:bg-accent [&.active]:text-accent-foreground'
)

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link
          to="/"
          className="text-foreground flex items-center gap-2 text-lg font-semibold"
          onClick={closeMobile}
        >
          <span>🐴</span>
          <span>סוס</span>
        </Link>

        {/* Links — desktop only; collapsed into the mobile panel below */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={linkClass}
                activeProps={{ className: 'active' }}
                activeOptions={{ exact: to === '/' }}
              >
                {label}
              </Link>
            </li>
          ))}
          {user?.role === 'super_admin' && (
            <li>
              <Link to="/admin" className={linkClass} activeProps={{ className: 'active' }}>
                פאנל ניהול
              </Link>
            </li>
          )}
        </ul>

        {/* Right side: auth + theme toggle (desktop), hamburger (mobile) */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-1.5 sm:flex">
                  {user?.role === 'super_admin' && <Badge variant="destructive">סופר מנהל</Badge>}
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
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`עבור למצב ${resolvedTheme === 'dark' ? 'בהיר' : 'כהה'}`}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'סגור תפריט' : 'פתח תפריט'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-border space-y-3 border-t px-4 py-3 md:hidden" dir="rtl">
          <ul className="space-y-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(linkClass, 'block px-3 py-2')}
                  activeProps={{ className: 'active' }}
                  activeOptions={{ exact: to === '/' }}
                  onClick={closeMobile}
                >
                  {label}
                </Link>
              </li>
            ))}
            {user?.role === 'super_admin' && (
              <li>
                <Link
                  to="/admin"
                  className={cn(linkClass, 'block px-3 py-2')}
                  activeProps={{ className: 'active' }}
                  onClick={closeMobile}
                >
                  פאנל ניהול
                </Link>
              </li>
            )}
          </ul>

          <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3">
            {isAuthenticated ? (
              <>
                <div className="flex flex-1 items-center gap-1.5">
                  {user?.role === 'super_admin' && <Badge variant="destructive">סופר מנהל</Badge>}
                  {user?.role === 'admin' && <Badge variant="warning">מנהל</Badge>}
                  <span className="text-muted-foreground truncate text-sm">{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobile()
                    logout().then(() => toast.success('התנתקת בהצלחה'))
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={closeMobile}>
                  <Button variant="ghost" size="sm" className="w-full">
                    כניסה
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={closeMobile}>
                  <Button size="sm" className="w-full">
                    הרשמה
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
