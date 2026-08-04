import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'brand' | 'green' | 'amber' | 'slate'
}

const TONE_CLASSES = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
} as const

export function StatCard({ label, value, icon: Icon, tone = 'brand' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  )
}
