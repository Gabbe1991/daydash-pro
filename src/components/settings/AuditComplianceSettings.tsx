import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Database, Download, Eye, Calendar, FileText } from 'lucide-react';

const auditComplianceSchema = z.object({
  dataRetentionMonths: z.number().min(6).max(120),
  scheduleHistoryRetention: z.number().min(12).max(120),
  auditLogRetention: z.number().min(12).max(120),
  enableAuditLogging: z.boolean(),
  enableComplianceReports: z.boolean(),
  privacyLevel: z.string(),
  allowDataExport: z.boolean(),
  requireApprovalForExport: z.boolean(),
  autoDeleteExpiredData: z.boolean(),
  encryptSensitiveData: z.boolean(),
  enableTwoFactorAuth: z.boolean(),
  sessionTimeoutMinutes: z.number().min(15).max(480),
});

type AuditComplianceForm = z.infer<typeof auditComplianceSchema>;

export function AuditComplianceSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuditComplianceForm>({
    resolver: zodResolver(auditComplianceSchema),
    defaultValues: {
      dataRetentionMonths: 24,
      scheduleHistoryRetention: 36,
      auditLogRetention: 60,
      enableAuditLogging: true,
      enableComplianceReports: true,
      privacyLevel: 'standard',
      allowDataExport: true,
      requireApprovalForExport: true,
      autoDeleteExpiredData: false,
      encryptSensitiveData: true,
      enableTwoFactorAuth: false,
      sessionTimeoutMinutes: 120,
    },
  });

  const onSubmit = async (data: AuditComplianceForm) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Compliance settings updated',
        description: 'Your audit and compliance settings have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update compliance settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAuditLog = async () => {
    toast({
      title: 'Export initiated',
      description: 'Your audit log export will be ready shortly.',
    });
  };

  const handleExportComplianceReport = async () => {
    toast({
      title: 'Export initiated',
      description: 'Your compliance report export will be ready shortly.',
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Retention
              </CardTitle>
              <CardDescription>
                Configure how long different types of data are stored.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dataRetentionMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Data Retention</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">months</span>
                        </div>
                      </FormControl>
                      <FormDescription>User data, requests, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduleHistoryRetention"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule History</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">months</span>
                        </div>
                      </FormControl>
                      <FormDescription>Historical schedules</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="auditLogRetention"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audit Log Retention</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">months</span>
                        </div>
                      </FormControl>
                      <FormDescription>Security and audit logs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoDeleteExpiredData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-delete Expired Data</FormLabel>
                      <FormDescription>
                        Automatically delete data when retention period expires
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy & Access Control
              </CardTitle>
              <CardDescription>
                Control who can see what data and configure privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="privacyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal - Only basic info visible</SelectItem>
                        <SelectItem value="standard">Standard - Standard business needs</SelectItem>
                        <SelectItem value="detailed">Detailed - Full transparency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controls how much employee information is visible to managers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowDataExport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Data Export</FormLabel>
                      <FormDescription>
                        Enable users to export their data and reports
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('allowDataExport') && (
                <FormField
                  control={form.control}
                  name="requireApprovalForExport"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 ml-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Export Approval</FormLabel>
                        <FormDescription>
                          Require manager approval for data exports
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Audit Logging
              </CardTitle>
              <CardDescription>
                Configure security settings and audit trail options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enableAuditLogging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Audit Logging</FormLabel>
                      <FormDescription>
                        Log all system actions for compliance and security
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="encryptSensitiveData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Encrypt Sensitive Data</FormLabel>
                      <FormDescription>
                        Use encryption for sensitive employee information
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableTwoFactorAuth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Two-Factor Authentication</FormLabel>
                      <FormDescription>
                        Require 2FA for all user accounts
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionTimeoutMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Timeout</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 max-w-xs">
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <span className="text-sm text-muted-foreground">minutes</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Automatically log out inactive users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Compliance Reports & Exports
              </CardTitle>
              <CardDescription>
                Generate and export compliance reports and audit trails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enableComplianceReports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Compliance Reports</FormLabel>
                      <FormDescription>
                        Generate automated compliance and audit reports
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Available Reports</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Audit Trail</p>
                        <p className="text-sm text-muted-foreground">Complete system activity log</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Last: 7 days ago</Badge>
                      <Button variant="outline" size="sm" onClick={handleExportAuditLog}>
                        Export
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Compliance Report</p>
                        <p className="text-sm text-muted-foreground">Schedule and policy compliance</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Last: 30 days ago</Badge>
                      <Button variant="outline" size="sm" onClick={handleExportComplianceReport}>
                        Export
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Compliance Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}