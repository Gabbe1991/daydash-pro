import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { RoleManagement as RoleManagementComponent } from '@/components/admin/RoleManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

export default function RoleManagement() {
  const { user } = useAuth();
  const { hasPermission } = useRole();

  // Only Company Admin can access Role Management
  const hasAccess = hasPermission('can_manage_roles');

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto mt-32">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                Only Company Administrators can access Role Management. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across your organization
          </p>
        </div>
      </div>

      <RoleManagementComponent />
    </div>
  );
}