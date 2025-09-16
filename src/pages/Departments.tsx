import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Lock } from 'lucide-react';

export default function Departments() {
  const { user } = useAuth();
  const { hasPermission } = useRole();

  // Role-based access check
  const hasAccess = hasPermission('can_manage_departments') || 
                   hasPermission('can_view_analytics');

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
                You don't have permission to view departments. Please contact your administrator.
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
        <div className="w-10 h-10 rounded-lg bg-gradient-company flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">
            {hasPermission('can_manage_departments') 
              ? 'Manage company departments and organizational structure'
              : 'View department information and structure'
            }
          </p>
        </div>
      </div>

      <DepartmentManagement />
    </div>
  );
}