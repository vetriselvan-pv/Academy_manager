import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { menusApi } from '@/api/menus.api'
import { cn } from '@/lib/utils'
import { MenuIcon } from './Icon'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menusApi.get(),
  })

  const menu = data?.menu ?? []

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 bg-white text-zinc-600">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5 text-zinc-900">
        <GraduationCap className="size-6 text-zinc-900" />
        <span className="text-base font-semibold">Viva Academy</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading && (
          <div className="animate-pulse space-y-2 px-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-8 rounded-lg bg-zinc-100" />
            ))}
          </div>
        )}

        <ul className="space-y-0.5">
          {menu.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                  )
                }
              >
                <MenuIcon name={item.icon} className="size-4 shrink-0" />
                {item.label}
              </NavLink>

              {item.children && item.children.length > 0 && (
                <ul className="mt-0.5 ml-6 space-y-0.5 border-l border-zinc-200 pl-3">
                  {item.children.map((child) => (
                    <li key={child.key}>
                      <NavLink
                        to={child.path}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                            isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
