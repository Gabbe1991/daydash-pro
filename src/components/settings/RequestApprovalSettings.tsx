import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Users, Clock, UserCheck } from 'lucide-react';

const requestApprovalSchema = z.object({
  autoApproveTimeOff: z.boolean(),
  autoApproveThreshold: z.number().min(1).max(24),
  autoApproveShiftSwaps: z.boolean(),
  requireApprovalRoles: z.array(z.string()).min(1),
  timeOffApprovalRoles: z.array(z.string()).min(1),
  shiftSwapApprovalRoles: z.array(z.string()).min(1),
  unavailabilityApprovalRoles: z.array(z.string()).min(1),
  approvalEscalation: z.boolean(),
  escalationDays: z.number().min(1).max(30),
});

type RequestApprovalForm = z.infer<typeof requestApprovalSchema>;

const availableRoles = [
  { id: 'role-admin', name: 'Company Admin' },
  { id: 'role-manager', name: 'Manager' },
  { id: 'role-manager-assistant', name: 'Manager Assistant' },
];

export function RequestApprovalSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RequestApprovalForm>({
    resolver: zodResolver(requestApprovalSchema),
    defaultValues: {
      autoApproveTimeOff: true,
      autoApproveThreshold: 8,
      autoApproveShiftSwaps: false,
      requireApprovalRoles: ['role-admin', 'role-manager'],
      timeOffApprovalRoles: ['role-admin', 'role-manager'],
      shiftSwapApprovalRoles: ['role-admin', 'role-manager'],
      unavailabilityApprovalRoles: ['role-admin', 'role-manager'],
      approvalEscalation: true,
      escalationDays: 3,
    },
  });

  const onSubmit = async (data: RequestApprovalForm) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Approval settings updated',
        description: 'Your request approval settings have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update approval settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const RoleCheckboxGroup = ({ 
    fieldName, 
    title, 
    description 
  }: { 
    fieldName: keyof RequestApprovalForm; 
    title: string; 
    description: string; 
  }) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={() => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base">{title}</FormLabel>
          <FormDescription>{description}</FormDescription>
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <FormField
                key={role.id}
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={role.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={Array.isArray(field.value) && field.value.includes(role.id)}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(field.value) ? field.value : [];
                            return checked
                              ? field.onChange([...currentValue, role.id])
                              : field.onChange(
                                  currentValue.filter((value) => value !== role.id)
                                )
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {role.name}
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
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Auto-Approval Rules
              </CardTitle>
              <CardDescription>
                Configure when requests should be automatically approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="autoApproveTimeOff"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-approve Time Off</FormLabel>
                      <FormDescription>
                        Automatically approve time off requests under the threshold
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('autoApproveTimeOff') && (
                <FormField
                  control={form.control}
                  name="autoApproveThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auto-approve Threshold (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="max-w-xs"
                        />
                      </FormControl>
                      <FormDescription>
                        Time off requests for this many hours or less will be auto-approved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="autoApproveShiftSwaps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-approve Shift Swaps</FormLabel>
                      <FormDescription>
                        Automatically approve shift swap requests between employees
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
                <Users className="w-5 h-5" />
                Approval Permissions
              </CardTitle>
              <CardDescription>
                Define which roles can approve different types of requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <RoleCheckboxGroup
                fieldName="timeOffApprovalRoles"
                title="Time Off Approval"
                description="Roles that can approve time off requests"
              />

              <RoleCheckboxGroup
                fieldName="shiftSwapApprovalRoles"
                title="Shift Swap Approval"
                description="Roles that can approve shift swap requests"
              />

              <RoleCheckboxGroup
                fieldName="unavailabilityApprovalRoles"
                title="Unavailability Approval"
                description="Roles that can approve unavailability periods"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Escalation Rules
              </CardTitle>
              <CardDescription>
                Configure what happens when requests are not approved in time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="approvalEscalation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Approval Escalation</FormLabel>
                      <FormDescription>
                        Escalate pending requests after a certain number of days
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('approvalEscalation') && (
                <FormField
                  control={form.control}
                  name="escalationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalation Period (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="max-w-xs"
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days before escalating pending requests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Approval Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}