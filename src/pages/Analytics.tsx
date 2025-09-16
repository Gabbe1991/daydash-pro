import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle,
  Building2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  UserCheck
} from 'lucide-react';
import { Analytics as AnalyticsType, EmployeeAnalytics, User, Department } from '@/types';
import { mockAPI, mockEmployees, mockDepartments } from '@/lib/mockData';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function Analytics() {
  const { user } = useAuth();
  const { getLegacyRole } = useRole();
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [employeeAnalytics, setEmployeeAnalytics] = useState<EmployeeAnalytics[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const legacyRole = getLegacyRole();
        const [analyticsData, employeeAnalyticsData, employeesData, departmentsData] = await Promise.all([
          mockAPI.getAnalytics(),
          mockAPI.getEmployeeAnalytics(),
          mockAPI.getEmployees(),
          mockAPI.getDepartments(),
        ]);

        setAnalytics(analyticsData);
        setEmployeeAnalytics(employeeAnalyticsData);
        setEmployees(employeesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user, selectedPeriod]);

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const legacyRole = getLegacyRole();
  const totalOvertimeHours = employeeAnalytics.reduce((sum, emp) => sum + emp.overtimeHours, 0);
  const avgPunctuality = Math.round(employeeAnalytics.reduce((sum, emp) => sum + emp.punctualityScore, 0) / employeeAnalytics.length);
  const totalCompletedShifts = employeeAnalytics.reduce((sum, emp) => sum + emp.completedShifts, 0);

  const renderKPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Hours Worked"
        value={analytics?.totalHours || 0}
        icon={Clock}
        trend={{ value: 12, isPositive: true }}
        description={`${selectedPeriod} to date`}
      />
      <StatsCard
        title="Overtime Hours"
        value={totalOvertimeHours}
        icon={AlertTriangle}
        variant="warning"
        trend={{ value: -5, isPositive: false }}
        description="Above standard hours"
      />
      <StatsCard
        title="Average Punctuality"
        value={`${avgPunctuality}%`}
        icon={CheckCircle}
        variant="success"
        trend={{ value: 3, isPositive: true }}
        description="On-time arrivals"
      />
      <StatsCard
        title="Completed Shifts"
        value={totalCompletedShifts}
        icon={UserCheck}
        trend={{ value: 18, isPositive: true }}
        description={`This ${selectedPeriod}`}
      />
    </div>
  );

  const renderWorkloadDistribution = () => (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Workload Distribution
            </CardTitle>
            <CardDescription>
              Hours worked across {legacyRole === 'company' ? 'departments' : 'team members'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {legacyRole === 'company' ? (
            departments.map((dept) => {
              const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
              const deptHours = employeeAnalytics
                .filter(emp => deptEmployees.some(e => e.id === emp.userId))
                .reduce((sum, emp) => sum + emp.totalHours, 0);
              const avgHours = deptEmployees.length > 0 ? Math.round(deptHours / deptEmployees.length) : 0;
              
              return (
                <div key={dept.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{deptEmployees.length} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{deptHours}h total</p>
                    <p className="text-sm text-muted-foreground">{avgHours}h avg</p>
                  </div>
                </div>
              );
            })
          ) : (
            employeeAnalytics.slice(0, 6).map((emp) => {
              const employee = employees.find(e => e.id === emp.userId);
              const efficiency = emp.totalHours > 0 ? Math.round((emp.completedShifts / emp.totalHours) * 100) : 0;
              
              return (
                <div key={emp.userId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee?.avatar} />
                      <AvatarFallback>
                        {emp.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{emp.userName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {emp.averageHoursPerWeek}h/week
                        </Badge>
                        {emp.overtimeHours > 0 && (
                          <Badge variant="outline" className="text-xs border-warning text-warning">
                            {emp.overtimeHours}h OT
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{emp.totalHours}h</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {efficiency >= 90 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-orange-500" />
                      )}
                      {efficiency}% efficiency
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAttendanceTrends = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Attendance & Punctuality Trends
        </CardTitle>
        <CardDescription>
          Track attendance patterns and punctuality scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Top Performers</h4>
            {employeeAnalytics
              .sort((a, b) => b.punctualityScore - a.punctualityScore)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={emp.userId} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' : 
                    index === 1 ? 'bg-gray-400 text-white' : 
                    'bg-orange-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {emp.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{emp.userName}</p>
                    <p className="text-xs text-muted-foreground">{emp.punctualityScore}% punctuality</p>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Needs Attention</h4>
            {employeeAnalytics
              .filter(emp => emp.punctualityScore < 90 || emp.pendingRequests > 2)
              .slice(0, 3)
              .map((emp) => (
                <div key={emp.userId} className="flex items-center gap-3 p-3 border border-warning/20 bg-warning/5 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {emp.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{emp.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.punctualityScore}% punctuality • {emp.pendingRequests} pending requests
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Detailed insights into workforce performance and productivity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1">
            {['week', 'month', 'quarter'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period as any)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {renderKPICards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderWorkloadDistribution()}
        {renderAttendanceTrends()}
      </div>

      {legacyRole === 'company' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Department Performance Summary
            </CardTitle>
            <CardDescription>
              Compare performance metrics across all departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Employees</th>
                    <th className="text-left p-3">Total Hours</th>
                    <th className="text-left p-3">Avg Punctuality</th>
                    <th className="text-left p-3">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
                    const deptAnalytics = employeeAnalytics.filter(emp => 
                      deptEmployees.some(e => e.id === emp.userId)
                    );
                    const deptHours = deptAnalytics.reduce((sum, emp) => sum + emp.totalHours, 0);
                    const deptOvertimeHours = deptAnalytics.reduce((sum, emp) => sum + emp.overtimeHours, 0);
                    const avgPunctuality = deptAnalytics.length > 0 
                      ? Math.round(deptAnalytics.reduce((sum, emp) => sum + emp.punctualityScore, 0) / deptAnalytics.length)
                      : 0;
                    
                    return (
                      <tr key={dept.id} className="border-b border-border/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                          </div>
                        </td>
                        <td className="p-3">{deptEmployees.length}</td>
                        <td className="p-3">{deptHours}h</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {avgPunctuality >= 95 ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : avgPunctuality >= 85 ? (
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            {avgPunctuality}%
                          </div>
                        </td>
                        <td className="p-3">
                          {deptOvertimeHours > 0 ? (
                            <Badge variant="outline" className="border-warning text-warning">
                              {deptOvertimeHours}h
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}