import { Permission } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  UserCheck, 
  Building2,
  Clock,
  Settings
} from 'lucide-react';

interface PermissionGroup {
  title: string;
  description: string;
  icon: React.ElementType;
  permissions: {
    permission: Permission;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: 'Schedule Management',
    description: 'Control over scheduling and shift assignments',
    icon: Calendar,
    permissions: [
      {
        permission: 'can_assign_shifts',
        label: 'Assign Shifts',
        description: 'Create and assign shifts to employees'
      },
      {
        permission: 'can_edit_schedules',
        label: 'Edit Schedules',
        description: 'Modify existing schedules and shifts'
      },
      {
        permission: 'can_manage_unavailability',
        label: 'Manage Unavailability',
        description: 'Set and update employee unavailability periods'
      }
    ]
  },
  {
    title: 'Request Approvals',
    description: 'Approve or deny various employee requests',
    icon: UserCheck,
    permissions: [
      {
        permission: 'can_approve_requests',
        label: 'Approve Requests',
        description: 'Approve time off and shift swap requests'
      },
      {
        permission: 'can_swap_shifts',
        label: 'Swap Shifts',
        description: 'Request and participate in shift swaps'
      },
      {
        permission: 'can_request_time_off',
        label: 'Request Time Off',
        description: 'Submit time off requests'
      }
    ]
  },
  {
    title: 'Analytics & Reporting',
    description: 'Access to analytics and performance reports',
    icon: BarChart3,
    permissions: [
      {
        permission: 'can_view_analytics',
        label: 'View Analytics',
        description: 'Access departmental analytics and reports'
      },
      {
        permission: 'can_view_company_analytics',
        label: 'View Company Analytics',
        description: 'Access company-wide analytics and reports'
      }
    ]
  },
  {
    title: 'Employee Management',
    description: 'Manage employee accounts and information',
    icon: Users,
    permissions: [
      {
        permission: 'can_view_all_employees',
        label: 'View All Employees',
        description: 'See all employees across departments'
      },
      {
        permission: 'can_create_accounts',
        label: 'Create Accounts',
        description: 'Create new employee accounts'
      },
      {
        permission: 'can_delete_accounts',
        label: 'Delete Accounts',
        description: 'Remove employee accounts from the system'
      }
    ]
  },
  {
    title: 'Administrative',
    description: 'System administration and configuration',
    icon: Shield,
    permissions: [
      {
        permission: 'can_manage_roles',
        label: 'Manage Roles',
        description: 'Create, edit, and delete custom roles'
      },
      {
        permission: 'can_manage_departments',
        label: 'Manage Departments',
        description: 'Create and manage company departments'
      }
    ]
  }
];

interface PermissionsMatrixProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}

export function PermissionsMatrix({ permissions, onChange, disabled = false }: PermissionsMatrixProps) {
  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (disabled) return;
    
    if (checked) {
      onChange([...permissions, permission]);
    } else {
      onChange(permissions.filter(p => p !== permission));
    }
  };

  const isPermissionChecked = (permission: Permission) => {
    return permissions.includes(permission);
  };

  const getGroupPermissionCount = (group: PermissionGroup) => {
    return group.permissions.filter(p => isPermissionChecked(p.permission)).length;
  };

  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => {
        const checkedCount = getGroupPermissionCount(group);
        const totalCount = group.permissions.length;
        const isGroupComplete = checkedCount === totalCount;
        const isGroupPartial = checkedCount > 0 && checkedCount < totalCount;

        return (
          <Card key={group.title} className={disabled ? 'opacity-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isGroupComplete 
                      ? 'bg-success text-success-foreground' 
                      : isGroupPartial 
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <group.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{group.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {checkedCount}/{totalCount}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3">
                {group.permissions.map((perm) => (
                  <div key={perm.permission} className="flex items-start space-x-3">
                    <Checkbox
                      id={perm.permission}
                      checked={isPermissionChecked(perm.permission)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(perm.permission, checked as boolean)
                      }
                      disabled={disabled}
                      className="mt-0.5"
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor={perm.permission}
                        className={`text-sm font-medium leading-none ${
                          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {perm.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Total Permissions</h4>
              <p className="text-sm text-muted-foreground">
                Selected permissions for this role
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{permissions.length}</div>
              <div className="text-sm text-muted-foreground">
                of {PERMISSION_GROUPS.reduce((acc, group) => acc + group.permissions.length, 0)} available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}