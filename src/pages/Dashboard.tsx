import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ScheduleCalendar } from '@/components/calendar/ScheduleCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Building2,
  Shield,
  UserCheck,
  Bell,
  Plus
} from 'lucide-react';
import { Schedule, TimeOffRequest, Analytics, EmployeeAnalytics, User } from '@/types';
import { mockAPI, mockEmployees } from '@/lib/mockData';
import { format } from 'date-fns';
import { UpcomingShifts } from '@/components/schedule/UpcomingShifts';

export default function Dashboard() {
  const { user } = useAuth();
  const { getLegacyRole } = useRole();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [employeeAnalytics, setEmployeeAnalytics] = useState<EmployeeAnalytics[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const legacyRole = getLegacyRole();
        const [schedulesData, requestsData, analyticsData, employeeAnalyticsData, employeesData] = await Promise.all([
          mockAPI.getSchedules(legacyRole === 'employee' ? user.id : undefined),
          mockAPI.getTimeOffRequests(legacyRole === 'employee' ? user.id : undefined),
          mockAPI.getAnalytics(),
          mockAPI.getEmployeeAnalytics(),
          mockAPI.getEmployees(),
        ]);

        setSchedules(schedulesData);
        setTimeOffRequests(requestsData);
        setAnalytics(analyticsData);
        setEmployeeAnalytics(employeeAnalyticsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderCompanyDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          description="Active employees"
        />
        <StatsCard
          title="Active Managers"
          value="1"
          icon={Shield}
          description="Managing teams"
        />
        <StatsCard
          title="Total Hours (Month)"
          value={analytics?.totalHours || 0}
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          description="Across all employees"
        />
        <StatsCard
          title="Pending Requests"
          value={timeOffRequests.filter(r => r.status === 'pending').length}
          icon={AlertTriangle}
          variant="warning"
          description="Awaiting approval"
        />
      </div>

      {/* Team Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Overview
          </CardTitle>
          <CardDescription>
            Monitor your team's performance and schedule overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeAnalytics.map((emp) => (
              <div key={emp.userId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={mockEmployees.find(e => e.id === emp.userId)?.avatar} />
                    <AvatarFallback>
                      {emp.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{emp.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {emp.totalHours}h this month • {emp.punctualityScore}% punctuality
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                <Badge variant={emp.pendingRequests > 0 ? 'outline' : 'default'}>
                  {emp.completedShifts} shifts
                </Badge>
                {emp.overtimeHours > 0 && (
                  <Badge variant="outline" className="border-warning text-warning">
                    {emp.overtimeHours}h OT
                  </Badge>
                )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Team Members"
          value={employees.length}
          icon={Users}
          description="Direct reports"
        />
        <StatsCard
          title="This Week's Hours"
          value={Math.round((analytics?.totalHours || 0) / 4)}
          icon={Clock}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Pending Requests"
          value={timeOffRequests.filter(r => r.status === 'pending').length}
          icon={Bell}
          variant="warning"
          description="Need your approval"
        />
        <StatsCard
          title="Schedule Compliance"
          value="94%"
          icon={CheckCircle}
          variant="success"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Schedule Calendar */}
      <ScheduleCalendar
        schedules={schedules}
        onScheduleClick={(schedule) => console.log('Schedule clicked:', schedule)}
      />

      {/* Team Performance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Team Performance
          </CardTitle>
          <CardDescription>
            Track your team's productivity and attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employeeAnalytics.slice(0, 3).map((emp) => (
              <div key={emp.userId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {emp.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{emp.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.averageHoursPerWeek}h/week avg
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{emp.punctualityScore}%</p>
                  <p className="text-xs text-muted-foreground">Punctuality</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmployeeDashboard = () => {
    const userAnalytics = employeeAnalytics.find(e => e.userId === user.id);
    const userSchedules = schedules.filter(s => s.userId === user.id);
    const userRequests = timeOffRequests.filter(r => r.userId === user.id);

    return (
      <div className="space-y-6">
        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Hours Worked"
            value={userAnalytics?.totalHours || 0}
            icon={Clock}
            trend={{ value: 3, isPositive: true }}
            description="This month"
          />
          <StatsCard
            title="Completed Shifts"
            value={userAnalytics?.completedShifts || 0}
            icon={CheckCircle}
            variant="success"
            description="This month"
          />
          <StatsCard
            title="Punctuality Score"
            value={`${userAnalytics?.punctualityScore || 0}%`}
            icon={UserCheck}
            variant="success"
            trend={{ value: 2, isPositive: true }}
          />
          <StatsCard
            title="Average Hours/Week"
            value={userAnalytics?.averageHoursPerWeek || 0}
            icon={TrendingUp}
            description="Last 4 weeks"
          />
        </div>

        {/* Employer Information & Contract */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Employer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-medium">TechCorp Solutions</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="font-medium">Engineering</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manager</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Sarah Johnson</p>
                    <Badge variant="outline" className="text-xs">Manager</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">📞 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(user.hireDate || '2024-01-01'), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Mock contract PDF export
                  const blob = new Blob(['Mock Contract PDF content'], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${user?.name}_employment_contract.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Contract (PDF)
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Team
              </CardTitle>
              <CardDescription>Who you're working with today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {employees.slice(0, 3).map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="bg-employee text-employee-foreground">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.jobTitle || 'Team Member'}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    9 AM - 5 PM
                  </Badge>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mini Upcoming Shifts Preview */}
          <UpcomingShifts 
            schedules={userSchedules}
            employees={employees.filter(emp => emp.departmentId === user.departmentId && emp.id !== user.id)}
            manager={employees.find(emp => emp.id === user.managerId) || null}
            userDepartmentId={user.departmentId}
            compact={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your {getLegacyRole() === 'company' ? 'company' : getLegacyRole() === 'manager' ? 'team' : 'schedule'} today.
          </p>
        </div>
        {getLegacyRole() !== 'employee' && (
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        )}
      </div>

      {getLegacyRole() === 'company' && renderCompanyDashboard()}
      {getLegacyRole() === 'manager' && renderManagerDashboard()}
      {getLegacyRole() === 'employee' && renderEmployeeDashboard()}
    </div>
  );
}