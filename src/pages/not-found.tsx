import { Link } from '@tanstack/react-router'
import { Home, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="bg-muted rounded-full p-6">
        <SearchX className="text-muted-foreground h-12 w-12" />
      </div>
      <div>
        <h1 className="text-foreground text-7xl font-bold tracking-tight">404</h1>
        <p className="text-foreground mt-2 text-xl font-semibold">הדף לא נמצא</p>
        <p className="text-muted-foreground mt-2 max-w-sm">
          הדף שחיפשת אינו קיים או הועבר למקום אחר.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <Home className="h-4 w-4" />
          חזרה לדף הבית
        </Link>
      </Button>
    </div>
  )
}
