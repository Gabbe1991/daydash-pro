import { useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Settings, Users, Bell, Shield } from 'lucide-react';
import { CompanyProfileSettings } from '@/components/settings/CompanyProfileSettings';
import { SchedulingPoliciesSettings } from '@/components/settings/SchedulingPoliciesSettings';
import { RequestApprovalSettings } from '@/components/settings/RequestApprovalSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AuditComplianceSettings } from '@/components/settings/AuditComplianceSettings';

export default function CompanySettings() {
  const { user, isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState('profile');

  // Only Company Admin can access settings
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only Company Administrators can access company settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Current Role: {user?.roleId}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Company Settings</h1>
        <p className="text-muted-foreground">
          Manage your company's configuration, policies, and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Policies</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Approvals</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <CompanyProfileSettings />
        </TabsContent>

        <TabsContent value="scheduling">
          <SchedulingPoliciesSettings />
        </TabsContent>

        <TabsContent value="approvals">
          <RequestApprovalSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="compliance">
          <AuditComplianceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}