import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
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
    <div className="flex h-full flex-col border-r border-zinc-200/50 bg-white/70 backdrop-blur-xl text-zinc-600">
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
                    'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive ? 'text-brand-900' : 'text-zinc-600 hover:text-brand-700',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-xl bg-brand-100/50"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <MenuIcon name={item.icon} className="relative z-10 size-4 shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
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
                            'block rounded-lg px-3 py-1.5 text-sm transition-all duration-200',
                            isActive ? 'bg-brand-50/80 text-brand-900 font-medium' : 'text-zinc-500 hover:bg-brand-50/50 hover:text-brand-700',
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
