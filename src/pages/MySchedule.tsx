import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduleCalendar } from '@/components/calendar/ScheduleCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Download, 
  Clock, 
  Users, 
  Phone,
  MapPin
} from 'lucide-react';
import { Schedule, User } from '@/types';
import { mockAPI } from '@/lib/mockData';
import { format } from 'date-fns';

export default function MySchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [coworkers, setCoworkers] = useState<User[]>([]);
  const [manager, setManager] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScheduleData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [schedulesData, employeesData] = await Promise.all([
          mockAPI.getSchedules(user.id),
          mockAPI.getEmployees(),
        ]);

        setSchedules(schedulesData);
        
        // Find manager and coworkers
        const managerUser = employeesData.find(emp => emp.id === user.managerId);
        const departmentCoworkers = employeesData.filter(emp => 
          emp.departmentId === user.departmentId && emp.id !== user.id
        );
        
        setManager(managerUser || null);
        setCoworkers(departmentCoworkers);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScheduleData();
  }, [user]);

  const handleExportSchedule = () => {
    // Mock PDF export functionality
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.name}_schedule_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todaySchedule = schedules.find(schedule => 
    format(new Date(schedule.startTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-employee flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
            <p className="text-muted-foreground">
              View your personal schedule and export to PDF
            </p>
          </div>
        </div>
        <Button onClick={handleExportSchedule} className="bg-gradient-employee hover:opacity-90">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Today's Info */}
      {todaySchedule && (
        <Card className="shadow-card border-l-4 border-l-employee">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Shift
            </CardTitle>
            <CardDescription>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Shift Time</p>
                <p className="font-medium">
                  {format(new Date(todaySchedule.startTime), 'h:mm a')} - {format(new Date(todaySchedule.endTime), 'h:mm a')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">Main Office - Floor 3</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                {manager && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback className="bg-manager text-manager-foreground text-xs">
                        {manager.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{manager.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{manager.phoneNumber || '(555) 123-4567'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScheduleCalendar
            schedules={schedules}
            onScheduleClick={(schedule) => console.log('Schedule clicked:', schedule)}
          />
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Team
              </CardTitle>
              <CardDescription>
                Your department colleagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {manager && (
                <div className="flex items-center gap-3 p-3 bg-manager-light rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={manager.avatar} />
                    <AvatarFallback className="bg-manager text-manager-foreground">
                      {manager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{manager.name}</p>
                    <p className="text-xs text-muted-foreground">Manager</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">Manager</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      📞 {manager.phoneNumber || '(555) 123-4567'}
                    </p>
                  </div>
                </div>
              )}
              
              {coworkers.slice(0, 4).map((coworker) => (
                <div key={coworker.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={coworker.avatar} />
                    <AvatarFallback className="bg-employee text-employee-foreground">
                      {coworker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{coworker.name}</p>
                    <p className="text-xs text-muted-foreground">{coworker.jobTitle || 'Team Member'}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Colleague
                  </Badge>
                </div>
              ))}
              
              {coworkers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No team members found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scheduled Hours</span>
                <span className="font-medium">32h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Shifts</span>
                <span className="font-medium">3/4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Shift</span>
                <span className="font-medium">Tomorrow 9 AM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}