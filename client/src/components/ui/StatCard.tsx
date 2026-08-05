import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
    >
      <Card className="flex items-center gap-4 p-5">
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
      </Card>
    </motion.div>
  )
}
