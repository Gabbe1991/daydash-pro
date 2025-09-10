import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Dashboard() {
  const { user } = useAuth();
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
        const [schedulesData, requestsData, analyticsData, employeeAnalyticsData, employeesData] = await Promise.all([
          mockAPI.getSchedules(user?.role === 'employee' ? user.id : undefined),
          mockAPI.getTimeOffRequests(user?.role === 'employee' ? user.id : undefined),
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Hours This Month"
            value={userAnalytics?.totalHours || 0}
            icon={Clock}
            trend={{ value: 3, isPositive: true }}
          />
          <StatsCard
            title="Completed Shifts"
            value={userAnalytics?.completedShifts || 0}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Upcoming Shifts"
            value={userSchedules.filter(s => s.status === 'active').length}
            icon={Calendar}
            description="This week"
          />
          <StatsCard
            title="Time Off Requests"
            value={userRequests.length}
            icon={UserCheck}
            variant={userRequests.some(r => r.status === 'pending') ? 'warning' : 'default'}
            description={`${userRequests.filter(r => r.status === 'pending').length} pending`}
          />
        </div>

        {/* My Schedule */}
        <ScheduleCalendar
          schedules={userSchedules}
          onScheduleClick={(schedule) => console.log('My schedule clicked:', schedule)}
        />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userSchedules.slice(0, 3).map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{schedule.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(schedule.startTime), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                    {schedule.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Time Off Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No time off requests</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Request Time Off
                  </Button>
                </div>
              ) : (
                userRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{request.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d')}
                      </p>
                    </div>
                    <Badge variant={
                      request.status === 'approved' ? 'default' : 
                      request.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
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
            Here's what's happening with your {user.role === 'company' ? 'company' : user.role === 'manager' ? 'team' : 'schedule'} today.
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          {user.role === 'employee' ? 'Request Time Off' : 'Create Schedule'}
        </Button>
      </div>

      {user.role === 'company' && renderCompanyDashboard()}
      {user.role === 'manager' && renderManagerDashboard()}
      {user.role === 'employee' && renderEmployeeDashboard()}
    </div>
  );
}