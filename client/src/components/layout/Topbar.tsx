import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { UserRole } from '@/types/enums'

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
}

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    toast.success('Logged out')
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden lg:block" />

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-zinc-50"
        >
          <Avatar name={user.name} />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-zinc-900">{user.name}</span>
            <Badge tone="brand" className="mt-0.5">
              {ROLE_LABELS[user.role]}
            </Badge>
          </span>
          <ChevronDown className="size-4 text-zinc-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                navigate('/profile')
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <UserIcon className="size-4" /> My Profile
            </button>
            <div className="my-1 border-t border-zinc-100" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
