import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  blue: 'bg-sky-50 text-sky-700',
} as const

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof TONE_CLASSES
}

export function Badge({ tone = 'slate', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  )
}
