import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, AlertTriangle, Calendar, Users } from 'lucide-react';

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  
  // Employee notifications
  employeeScheduleChanges: z.boolean(),
  employeeRequestApproval: z.boolean(),
  employeeShiftReminders: z.boolean(),
  employeeOvertimeAlerts: z.boolean(),
  
  // Manager notifications
  managerPendingRequests: z.boolean(),
  managerScheduleConflicts: z.boolean(),
  managerOvertimeAlerts: z.boolean(),
  managerStaffingAlerts: z.boolean(),
  
  // Admin notifications
  adminSystemAlerts: z.boolean(),
  adminComplianceAlerts: z.boolean(),
  adminUserActivity: z.boolean(),
  
  // Timing
  reminderHours: z.array(z.number()),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
});

type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>;

export function NotificationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      inAppNotifications: true,
      smsNotifications: false,
      
      employeeScheduleChanges: true,
      employeeRequestApproval: true,
      employeeShiftReminders: true,
      employeeOvertimeAlerts: false,
      
      managerPendingRequests: true,
      managerScheduleConflicts: true,
      managerOvertimeAlerts: true,
      managerStaffingAlerts: true,
      
      adminSystemAlerts: true,
      adminComplianceAlerts: true,
      adminUserActivity: false,
      
      reminderHours: [24, 2],
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    },
  });

  const onSubmit = async (data: NotificationSettingsForm) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
    fieldName, 
    title, 
    description, 
    icon: Icon 
  }: { 
    fieldName: keyof NotificationSettingsForm; 
    title: string; 
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5 flex items-center gap-3">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <FormLabel className="text-base">{title}</FormLabel>
              <FormDescription>{description}</FormDescription>
            </div>
          </div>
          <FormControl>
            <Switch 
              checked={typeof field.value === 'boolean' ? field.value : false} 
              onCheckedChange={field.onChange} 
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

  const reminderOptions = [
    { value: 168, label: '1 week before' },
    { value: 24, label: '24 hours before' },
    { value: 4, label: '4 hours before' },
    { value: 2, label: '2 hours before' },
    { value: 1, label: '1 hour before' },
    { value: 0.5, label: '30 minutes before' },
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                fieldName="emailNotifications"
                title="Email Notifications"
                description="Receive notifications via email"
                icon={Mail}
              />
              <NotificationToggle
                fieldName="inAppNotifications"
                title="In-App Notifications"
                description="Show notifications within the application"
                icon={Bell}
              />
              <NotificationToggle
                fieldName="smsNotifications"
                title="SMS Notifications"
                description="Receive critical notifications via SMS"
                icon={Smartphone}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Notifications
              </CardTitle>
              <CardDescription>
                Configure what notifications employees receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                fieldName="employeeScheduleChanges"
                title="Schedule Changes"
                description="Notify when schedules are updated"
                icon={Calendar}
              />
              <NotificationToggle
                fieldName="employeeRequestApproval"
                title="Request Status Updates"
                description="Notify when requests are approved or denied"
                icon={Bell}
              />
              <NotificationToggle
                fieldName="employeeShiftReminders"
                title="Shift Reminders"
                description="Send reminders before scheduled shifts"
                icon={Calendar}
              />
              <NotificationToggle
                fieldName="employeeOvertimeAlerts"
                title="Overtime Alerts"
                description="Alert when approaching overtime hours"
                icon={AlertTriangle}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Manager Notifications
              </CardTitle>
              <CardDescription>
                Configure notifications for managers and supervisors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                fieldName="managerPendingRequests"
                title="Pending Requests"
                description="Notify about requests requiring approval"
                icon={Bell}
              />
              <NotificationToggle
                fieldName="managerScheduleConflicts"
                title="Schedule Conflicts"
                description="Alert when scheduling conflicts occur"
                icon={AlertTriangle}
              />
              <NotificationToggle
                fieldName="managerOvertimeAlerts"
                title="Team Overtime Alerts"
                description="Alert when team members are approaching overtime"
                icon={AlertTriangle}
              />
              <NotificationToggle
                fieldName="managerStaffingAlerts"
                title="Staffing Alerts"
                description="Notify about understaffing or overstaffing"
                icon={Users}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Admin Notifications
              </CardTitle>
              <CardDescription>
                Configure notifications for company administrators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                fieldName="adminSystemAlerts"
                title="System Alerts"
                description="Critical system notifications and errors"
                icon={AlertTriangle}
              />
              <NotificationToggle
                fieldName="adminComplianceAlerts"
                title="Compliance Alerts"
                description="Notify about compliance violations or issues"
                icon={AlertTriangle}
              />
              <NotificationToggle
                fieldName="adminUserActivity"
                title="User Activity Alerts"
                description="Notify about unusual user activity"
                icon={Users}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure when and how often to send reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="reminderHours"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base">Shift Reminders</FormLabel>
                    <FormDescription>
                      When to send reminders before scheduled shifts
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {reminderOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="reminderHours"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={Array.isArray(field.value) && field.value.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = Array.isArray(field.value) ? field.value : [];
                                      return checked
                                        ? field.onChange([...currentValue, option.value])
                                        : field.onChange(
                                            currentValue.filter((value) => value !== option.value)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quietHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours Start</FormLabel>
                      <FormControl>
                        <input
                          type="time"
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quietHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours End</FormLabel>
                      <FormControl>
                        <input
                          type="time"
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>
                No notifications will be sent during quiet hours except for critical alerts.
              </FormDescription>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}