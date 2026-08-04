import type { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Viva Academy</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </div>

        {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  )
}
