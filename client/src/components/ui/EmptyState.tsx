import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}
