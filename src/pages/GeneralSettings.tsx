import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Monitor, 
  Moon, 
  Sun, 
  Check,
  CreditCard,
  User,
  Bell,
  Plug,
  Shield,
  Mail,
  Smartphone,
  HelpCircle,
  Puzzle,
  DollarSign,
  BarChart3,
  Users
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';

const GeneralSettings = () => {
  const { mode, setMode, colorTheme, setColorTheme, colorThemes } = useTheme();
  const { getLegacyRole } = useRole();
  
  const legacyRole = getLegacyRole();
  const canViewBilling = legacyRole === 'company' || legacyRole === 'manager';

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const availableColorThemes = colorThemes.slice(1);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>

              <Tabs defaultValue="appearance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="appearance" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Appearance
                  </TabsTrigger>
                  {canViewBilling && (
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2">
                    <Plug className="w-4 h-4" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="support" className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Support
                  </TabsTrigger>
                  <TabsTrigger value="extensions" className="flex items-center gap-2">
                    <Puzzle className="w-4 h-4" />
                    Extensions
                  </TabsTrigger>
                </TabsList>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-6">
                  {/* Theme Mode */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Theme Mode
                      </CardTitle>
                      <CardDescription>
                        Choose between light and dark themes, or sync with your system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {themeOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = mode === option.id;
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => setMode(option.id as any)}
                              className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors duration-200",
                                "hover:bg-muted/50",
                                isSelected 
                                  ? "border-primary bg-primary/10 shadow-lg" 
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <Icon className={cn(
                                "w-12 h-12",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )} />
                              <div className="text-center">
                                <p className={cn(
                                  "font-medium text-lg",
                                  isSelected ? "text-primary" : "text-foreground"
                                )}>
                                  {option.label}
                                </p>
                                {isSelected && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Active
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Custom Colors
                      </CardTitle>
                      <CardDescription>
                        Choose colors for buttons and theme elements.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {availableColorThemes.map((theme) => {
                          const isSelected = colorTheme.id === theme.id;
                          
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setColorTheme(theme)}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border-2 transition-colors duration-200",
                                "hover:bg-muted/30 relative",
                                isSelected 
                                  ? "border-primary bg-primary/10 shadow-lg" 
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              {/* Color Preview */}
                              <div className="flex gap-1">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                                />
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                                />
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                                />
                              </div>
                              
                              {/* Color Name */}
                              <span className="font-medium text-foreground flex-1 text-left">{theme.name}</span>
                              
                              {/* Selected Indicator */}
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Preview Button */}
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="font-medium text-foreground">Preview</h4>
                        <div className="flex flex-wrap gap-3">
                          <Button>Primary Button</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Billing Tab */}
                {canViewBilling && (
                  <TabsContent value="billing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Subscription & Billing
                      </CardTitle>
                      <CardDescription>
                        Manage your subscription and payment methods.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Current Plan</Label>
                          <p className="text-sm text-muted-foreground">Professional Plan - $29/month</p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Payment Method</Label>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                                <p className="text-xs text-muted-foreground">Expires 12/25</p>
                              </div>
                            </div>
                            <Button size="sm">Update</Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">Billing History</Label>
                          <Button className="w-full justify-start">
                            View Billing History
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </TabsContent>
                )}

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Update your account details and security settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john.doe@example.com" />
                      </div>
                      
                      <Separator />
                      
                        <div className="space-y-4">
                          <Label className="text-base font-medium">Security</Label>
                          <div className="space-y-3">
                            <Button className="w-full justify-start">
                              <Shield className="w-4 h-4 mr-2" />
                              Change Password
                            </Button>
                            <Button className="w-full justify-start">
                              <Smartphone className="w-4 h-4 mr-2" />
                              Two-Factor Authentication
                            </Button>
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to be notified about updates and changes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications in browser
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Schedule Changes</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when your schedule changes
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">System Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                              Important system updates and announcements
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plug className="w-5 h-5" />
                        Third-Party Integrations
                      </CardTitle>
                      <CardDescription>
                        Connect your account with external services and applications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-medium">Google Calendar</p>
                              <p className="text-sm text-muted-foreground">Sync schedules with Google Calendar</p>
                            </div>
                          </div>
                          <Button>Connect</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-8 h-8 text-blue-700" />
                            <div>
                              <p className="font-medium">Outlook Calendar</p>
                              <p className="text-sm text-muted-foreground">Sync schedules with Microsoft Outlook</p>
                            </div>
                          </div>
                          <Button>Connect</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bell className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-medium">Slack</p>
                              <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
                            </div>
                          </div>
                          <Button>Connect</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="font-medium">Microsoft Teams</p>
                              <p className="text-sm text-muted-foreground">Share schedules and collaborate in Teams</p>
                            </div>
                          </div>
                          <Button>Connect</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Support Tab */}
                <TabsContent value="support" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Support & Help
                      </CardTitle>
                      <CardDescription>
                        Get help and support for WorkScheduler.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-medium">Contact Support</p>
                              <p className="text-sm text-muted-foreground">support@workscheduler.com</p>
                            </div>
                          </div>
                          <Button>Email Support</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <HelpCircle className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-medium">Documentation</p>
                              <p className="text-sm text-muted-foreground">Learn how to use WorkScheduler effectively</p>
                            </div>
                          </div>
                          <Button>View Docs</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="font-medium">Community Forum</p>
                              <p className="text-sm text-muted-foreground">Connect with other WorkScheduler users</p>
                            </div>
                          </div>
                          <Button>Join Community</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Extensions Tab */}
                <TabsContent value="extensions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Puzzle className="w-5 h-5" />
                        Extensions & Add-ons
                      </CardTitle>
                      <CardDescription>
                        Extend WorkScheduler functionality with premium features and integrations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-medium">Payroll Extension</p>
                              <p className="text-sm text-muted-foreground">Connect scheduling to payroll systems for seamless time tracking</p>
                            </div>
                          </div>
                          <Button>Install</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-medium">Reporting Extension</p>
                              <p className="text-sm text-muted-foreground">Advanced analytics, custom KPIs, and PDF export capabilities</p>
                            </div>
                          </div>
                          <Button>Install</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="font-medium">HR Tools Extension</p>
                              <p className="text-sm text-muted-foreground">Employee histories, vacation requests, and performance records</p>
                            </div>
                          </div>
                          <Button>Install</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GeneralSettings;