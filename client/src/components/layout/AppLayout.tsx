import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full w-64">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-md p-1 text-slate-300 hover:bg-slate-800"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setMobileNavOpen(true)} />
        <main className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
