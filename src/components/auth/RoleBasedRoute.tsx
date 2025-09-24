import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { LoginForm } from './LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectPath?: string;
}

export function RoleBasedRoute({ children, allowedRoles, redirectPath }: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasPermission } = useRole();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }

  // Check if user's role is in allowed roles
  if (!allowedRoles.includes(user.roleId)) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="max-w-md mx-auto mt-32">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center">
                  <Shield className="w-5 h-5 text-destructive mx-auto" />
                  Access Restricted
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to access this page. This page is restricted to specific roles.
                </p>
                <p className="text-sm text-muted-foreground">
                  Current Role: {user.roleId.replace('role-', '').charAt(0).toUpperCase() + user.roleId.replace('role-', '').slice(1)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return <MainLayout>{children}</MainLayout>;
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleBasedRoute allowedRoles={['role-admin']}>{children}</RoleBasedRoute>;
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return <RoleBasedRoute allowedRoles={['role-manager']}>{children}</RoleBasedRoute>;
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return <RoleBasedRoute allowedRoles={['role-employee']}>{children}</RoleBasedRoute>;
}

export function AdminManagerRoute({ children }: { children: React.ReactNode }) {
  return <RoleBasedRoute allowedRoles={['role-admin', 'role-manager']}>{children}</RoleBasedRoute>;
}