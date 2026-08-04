import {
  BarChart3,
  Book,
  Circle,
  ClipboardList,
  GraduationCap,
  Home,
  MapPin,
  Settings,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  'map-pin': MapPin,
  book: Book,
  users: Users,
  'graduation-cap': GraduationCap,
  'clipboard-list': ClipboardList,
  'bar-chart': BarChart3,
  user: User,
  settings: Settings,
}

export function MenuIcon({ name, className }: { name?: string; className?: string }) {
  const IconComponent = (name && ICON_MAP[name]) || Circle
  return <IconComponent className={className} aria-hidden="true" />
}
