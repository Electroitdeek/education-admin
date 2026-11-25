import { AdminUser } from '@/components/auth/AdminLoginView';

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

/**
 * Check if the given AdminUser has permission for a specific module and action.
 * Super Admin has unconditional access to all modules and actions.
 */
export function hasPermission(
  user: AdminUser | null | undefined,
  moduleKey: string,
  action: PermissionAction = 'view',
): boolean {
  if (!user) return false;

  // Super Admin has root access
  if (
    user.role === 'Super Admin' ||
    user.role?.toLowerCase() === 'super admin' ||
    user.role?.toLowerCase() === 'admin'
  ) {
    return true;
  }

  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  const mod = user.permissions.find((p) => p.module === moduleKey);
  if (!mod) return false;

  switch (action) {
    case 'view':
      return !!mod.canView;
    case 'add':
      return !!mod.canAdd;
    case 'edit':
      return !!mod.canEdit;
    case 'delete':
      return !!mod.canDelete;
    default:
      return false;
  }
}

