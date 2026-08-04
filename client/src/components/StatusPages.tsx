import { Link } from 'react-router-dom'
import { FileQuestion, ShieldAlert } from 'lucide-react'

const linkButtonClasses =
  'inline-flex h-9.5 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50'

export function ForbiddenPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <ShieldAlert className="size-6" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">You don't have access to this</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Your account role or permissions don't allow viewing this page. Contact your Super Admin if you think this is
        a mistake.
      </p>
      <Link to="/dashboard" className={linkButtonClasses}>
        Back to dashboard
      </Link>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileQuestion className="size-6" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard" className={linkButtonClasses}>
        Back to dashboard
      </Link>
    </div>
  )
}
