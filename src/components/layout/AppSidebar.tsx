import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Clock,
  UserCheck,
  Building2,
  LogOut,
  ChevronDown,
  Bell,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = {
  company: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'Company Settings', url: '/company', icon: Building2 },
    { title: 'Role Management', url: '/roles', icon: Shield },
    { title: 'Departments', url: '/departments', icon: Building2 },
    { title: 'All Employees', url: '/employees', icon: Users },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'Settings', url: '/settings', icon: Settings },
  ],
  manager: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'Schedule', url: '/schedule', icon: Calendar },
    { title: 'My Team', url: '/team', icon: Users },
    { title: 'Requests', url: '/requests', icon: Bell },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'Settings', url: '/settings', icon: Settings },
  ],
  employee: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'My Schedule', url: '/schedule', icon: Calendar },
    { title: 'Time Off', url: '/time-off', icon: Clock },
    { title: 'Shift Swaps', url: '/swaps', icon: UserCheck },
    { title: 'Settings', url: '/settings', icon: Settings },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout, switchRole } = useAuth();
  const { getLegacyRole } = useRole();
  const location = useLocation();

  if (!user) return null;

  const currentPath = location.pathname;
  const legacyRole = getLegacyRole();
  const items = legacyRole ? navigationItems[legacyRole] : [];
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  const getNavClass = (active: boolean) =>
    active 
      ? `bg-${legacyRole} text-${legacyRole}-foreground font-medium shadow-sm` 
      : 'hover:bg-muted/50 transition-smooth';

  const getRoleColor = (role: string) => {
    const colors = {
      company: 'bg-company text-company-foreground',
      manager: 'bg-manager text-manager-foreground',
      employee: 'bg-employee text-employee-foreground',
    };
    return colors[role as keyof typeof colors] || colors.employee;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="border-r border-border bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-${legacyRole}`}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  WorkScheduler
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-muted/50">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className={getRoleColor(legacyRole || 'employee')}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs ${getRoleColor(legacyRole || 'employee')}`}>
                          {legacyRole?.charAt(0).toUpperCase() + legacyRole?.slice(1) || 'Employee'}
                        </Badge>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchRole('company')}>
                <Building2 className="w-4 h-4 mr-2" />
                Company Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('manager')}>
                <Shield className="w-4 h-4 mr-2" />
                Manager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('employee')}>
                <Users className="w-4 h-4 mr-2" />
                Employee
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(isActive(item.url))}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-border">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}