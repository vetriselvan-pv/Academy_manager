import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} aria-hidden="true" />
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}
