import { MenuItem } from '../../config/menu';
import { AuthUser, UserRole } from '../../types';

function isItemVisible(item: MenuItem, authUser: AuthUser): boolean {
  const roleOk = !item.roles || item.roles.includes(authUser.role);
  const permissionsOk =
    !item.permissions ||
    (authUser.role === UserRole.TEACHER && item.permissions.every((p) => authUser.permissions.includes(p)));
  return roleOk && permissionsOk;
}

/**
 * Filters the static menu tree down to what a given user is allowed to see.
 * SUPER_ADMIN always gets the full tree. Everyone else is filtered per-item;
 * a parent with no visibility rule of its own still shows up if at least one
 * of its children is visible (e.g. "Courses" > "Manage Courses").
 */
export function filterMenu(items: MenuItem[], authUser: AuthUser): MenuItem[] {
  if (authUser.role === UserRole.SUPER_ADMIN) {
    return items;
  }

  const result: MenuItem[] = [];
  for (const item of items) {
    const children = item.children ? filterMenu(item.children, authUser) : undefined;
    const selfVisible = isItemVisible(item, authUser);

    if (!selfVisible && (!children || children.length === 0)) {
      continue;
    }

    result.push(children ? { ...item, children } : item);
  }
  return result;
}
