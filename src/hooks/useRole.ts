import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Permission } from '@/types';

// Mock roles data - would come from API in real app
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'role-admin': [
    'can_approve_requests',
    'can_assign_shifts',
    'can_view_analytics',
    'can_manage_roles',
    'can_manage_departments',
    'can_create_accounts',
    'can_delete_accounts',
    'can_view_company_analytics',
    'can_edit_schedules',
    'can_view_all_employees',
    'can_manage_unavailability'
  ],
  'role-manager': [
    'can_approve_requests',
    'can_assign_shifts',
    'can_view_analytics',
    'can_edit_schedules',
    'can_view_all_employees',
    'can_manage_unavailability'
  ],
  'role-employee': [
    'can_swap_shifts',
    'can_request_time_off',
    'can_manage_unavailability'
  ]
};

const ROLE_TO_LEGACY: Record<string, UserRole> = {
  'role-admin': 'company',
  'role-manager': 'manager',
  'role-employee': 'employee'
};

export function useRole() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.roleId] || [];
    return permissions.includes(permission);
  };

  const getLegacyRole = (): UserRole | null => {
    if (!user) return null;
    return ROLE_TO_LEGACY[user.roleId] || 'employee';
  };

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.roleId] || [];
  };

  return {
    user,
    hasPermission,
    getLegacyRole,
    getUserPermissions,
    isAdmin: user?.roleId === 'role-admin',
    isManager: user?.roleId === 'role-manager',
    isEmployee: user?.roleId === 'role-employee',
  };
}