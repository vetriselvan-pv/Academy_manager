import { Permission, UserRole } from '../types';

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  /** Roles allowed to see this item. Omit to allow every authenticated role. */
  roles?: UserRole[];
  /** Extra permission gate, only evaluated for TEACHER (SUPER_ADMIN always passes, STUDENT has none). */
  permissions?: Permission[];
  children?: MenuItem[];
}

export const MENU_TREE: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
  {
    key: 'branches',
    label: 'Branches',
    path: '/branches',
    icon: 'map-pin',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    key: 'courses',
    label: 'Courses',
    path: '/courses',
    icon: 'book',
  },
  {
    key: 'teachers',
    label: 'Teachers',
    path: '/teachers',
    icon: 'users',
    roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
  },
  {
    key: 'students',
    label: 'Students',
    path: '/students',
    icon: 'graduation-cap',
    roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
    permissions: [Permission.VIEW_STUDENTS],
  },
  {
    key: 'enrollments',
    label: 'Enrollments',
    path: '/enrollments',
    icon: 'clipboard-list',
    roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
    permissions: [Permission.VIEW_ENROLLMENTS],
  },
  {
    key: 'my-enrollments',
    label: 'My Courses',
    path: '/my-enrollments',
    icon: 'clipboard-list',
    roles: [UserRole.STUDENT],
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'bar-chart',
    roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
    permissions: [Permission.VIEW_REPORTS],
  },
  { key: 'profile', label: 'My Profile', path: '/profile', icon: 'user' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
];
