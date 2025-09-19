import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Calendar, Users, Phone } from 'lucide-react';
import { Schedule, User } from '@/types';
import { format, isAfter } from 'date-fns';

interface UpcomingShiftsProps {
  schedules: Schedule[];
  employees: User[];
  manager?: User | null;
  compact?: boolean;
  showTitle?: boolean;
  userDepartmentId?: string;
}

export function UpcomingShifts({ 
  schedules, 
  employees, 
  manager, 
  compact = false, 
  showTitle = true,
  userDepartmentId
}: UpcomingShiftsProps) {
  // Get next 3 upcoming shifts
  const upcomingShifts = schedules
    .filter(schedule => isAfter(new Date(schedule.startTime), new Date()))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Get coworkers for each shift based on user's department
  const getShiftCoworkers = () => {
    return employees.filter(emp => emp.departmentId === userDepartmentId).slice(0, 2);
  };

  if (upcomingShifts.length === 0) {
    return (
      <Card className="shadow-card">
        {showTitle && (
          <CardHeader className={compact ? "pb-3" : ""}>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Upcoming Shifts
            </CardTitle>
            <CardDescription>Your next scheduled shifts</CardDescription>
          </CardHeader>
        )}
        <CardContent className={compact ? "pt-0" : ""}>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming shifts scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      {showTitle && (
        <CardHeader className={compact ? "pb-3" : ""}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Upcoming Shifts
          </CardTitle>
          <CardDescription>Your next {upcomingShifts.length} scheduled shifts</CardDescription>
        </CardHeader>
      )}
      <CardContent className={`space-y-4 ${compact ? "pt-0" : ""}`}>
        {upcomingShifts.map((shift, index) => {
          const coworkers = getShiftCoworkers();
          const isNext = index === 0;
          
          return (
            <div 
              key={shift.id} 
              className={`p-4 rounded-lg border ${isNext ? 'bg-primary/5 border-primary/20' : 'border-border'}`}
            >
              {/* Shift Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">
                      {format(new Date(shift.startTime), 'EEEE, MMM d')}
                    </h4>
                    {isNext && (
                      <Badge variant="default" className="text-xs">Next</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Department: Engineering
                  </div>
                </div>
              </div>

              {/* Coworkers */}
              {coworkers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Working with</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {coworkers.map((coworker) => (
                      <div key={coworker.id} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={coworker.avatar} />
                          <AvatarFallback className="bg-employee text-employee-foreground text-xs">
                            {coworker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{coworker.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager Contact */}
              {manager && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>Supervisor: {manager.name}</span>
                    <span>•</span>
                    <span>{manager.phoneNumber || '(555) 123-4567'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}