import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  /** Width cap of the panel. Defaults to max-w-lg. */
  className?: string
}

/**
 * Overlay + panel shell shared by the app's dialogs.
 * Closes on Escape and on backdrop click; locks body scroll while open.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        dir="rtl"
        className={cn(
          'bg-background border-border flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border shadow-xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title !== undefined && (
          <div className="border-border flex items-start justify-between gap-3 border-b p-6">
            <div className="min-w-0 flex-1">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="text-muted-foreground hover:text-foreground -mt-1 shrink-0 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
