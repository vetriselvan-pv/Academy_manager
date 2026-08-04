import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700',
        className,
      )}
    >
      {initials(name) || '?'}
    </div>
  )
}
