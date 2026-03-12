import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'purple'
  | 'teal'
  | 'orange'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/20',
  success: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-700 border border-amber-500/20 dark:text-amber-400',
  info: 'bg-sky-500/15 text-sky-700 border border-sky-500/20 dark:text-sky-400',
  purple: 'bg-purple-500/15 text-purple-700 border border-purple-500/20 dark:text-purple-400',
  teal: 'bg-teal-500/15 text-teal-700 border border-teal-500/20 dark:text-teal-400',
  orange: 'bg-orange-500/15 text-orange-700 border border-orange-500/20 dark:text-orange-400',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
