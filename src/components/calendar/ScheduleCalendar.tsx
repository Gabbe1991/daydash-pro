import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  viewMode?: 'month' | 'week' | 'day';
  className?: string;
}

export function ScheduleCalendar({
  schedules,
  selectedDate = new Date(),
  onDateSelect,
  onScheduleClick,
  viewMode = 'month',
  className,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  // Get schedules for the selected date
  const schedulesForDate = useMemo(() => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.startTime), currentDate)
    );
  }, [schedules, currentDate]);

  // Get dates with schedules for calendar highlighting
  const datesWithSchedules = useMemo(() => {
    const dates = new Set<string>();
    schedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      dates.add(format(scheduleDate, 'yyyy-MM-dd'));
    });
    return dates;
  }, [schedules]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      onDateSelect?.(date);
    }
  };

  const getScheduleStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Calendar */}
      <Card className="lg:col-span-2 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Calendar
          </CardTitle>
          <CardDescription>
            Click on a date to view scheduled shifts. Dates with schedules are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            className="rounded-lg border p-3"
            modifiers={{
              hasSchedule: (date) => datesWithSchedules.has(format(date, 'yyyy-MM-dd')),
            }}
            modifiersStyles={{
              hasSchedule: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Schedule Details */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(currentDate, 'EEEE, MMMM d')}
          </CardTitle>
          <CardDescription>
            {schedulesForDate.length} scheduled shift{schedulesForDate.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedulesForDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No shifts scheduled for this date</p>
            </div>
          ) : (
            schedulesForDate.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth cursor-pointer"
                onClick={() => onScheduleClick?.(schedule)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{schedule.title}</h4>
                    <Badge className={getScheduleStatusColor(schedule.status)} variant="secondary">
                      {schedule.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
                    </div>
                  </div>

                  {schedule.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      Recurring
                    </Badge>
                  )}

                  {schedule.notes && (
                    <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                      {schedule.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}