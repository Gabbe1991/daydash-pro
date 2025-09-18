import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Edit2,
  Trash2,
  Download,
  Copy,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { Schedule, User, Department } from '@/types';
import { mockAPI, mockEmployees, mockDepartments } from '@/lib/mockData';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 'morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', color: 'bg-blue-500' },
  { id: 'afternoon', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00', color: 'bg-green-500' },
  { id: 'evening', name: 'Evening Shift', startTime: '22:00', endTime: '06:00', color: 'bg-purple-500' },
  { id: 'custom', name: 'Custom Hours', startTime: '09:00', endTime: '17:00', color: 'bg-orange-500' },
];

export default function DepartmentSchedule() {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newShift, setNewShift] = useState({
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
    employeeId: '',
  });

  // Check permissions - only managers with proper access
  const hasAccess = hasPermission('can_edit_schedules') || hasPermission('can_assign_shifts');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [schedulesData, employeesData, departmentsData] = await Promise.all([
          mockAPI.getSchedules(),
          mockAPI.getEmployees(),
          mockAPI.getDepartments(),
        ]);
        
        // Filter to manager's department only
        const managerDepartment = departmentsData.find(d => d.managerId === user?.id);
        const departmentEmployees = managerDepartment 
          ? employeesData.filter(e => e.departmentId === managerDepartment.id)
          : [];
        
        setSchedules(schedulesData.filter(s => departmentEmployees.some(e => e.id === s.userId)));
        setEmployees(departmentEmployees);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto mt-32">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Schedule Access Required</h2>
              <p className="text-muted-foreground">
                You need schedule management permissions to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateShift = () => {
    if (!newShift.title || !newShift.startTime || !newShift.endTime || !newShift.employeeId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const shift: Schedule = {
      id: `schedule-${Date.now()}`,
      userId: newShift.employeeId,
      managerId: user?.id || '',
      title: newShift.title,
      startTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newShift.startTime}:00`,
      endTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newShift.endTime}:00`,
      isRecurring: false,
      status: 'active',
      notes: newShift.notes,
      createdAt: new Date().toISOString(),
    };

    setSchedules([...schedules, shift]);
    setIsCreateShiftOpen(false);
    setNewShift({ title: '', startTime: '', endTime: '', notes: '', employeeId: '' });
    
    toast({
      title: "Shift Created",
      description: `Shift assigned to ${employees.find(e => e.id === newShift.employeeId)?.name}`,
    });
  };

  const handleTemplateSelect = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setNewShift({
      ...newShift,
      title: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
    });
  };

  const getDaySchedules = (date: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.startTime), date)
    );
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const checkConflicts = (employeeId: string, startTime: string, endTime: string) => {
    const employeeSchedules = schedules.filter(s => s.userId === employeeId);
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    
    return employeeSchedules.some(schedule => {
      const scheduleStart = new Date(schedule.startTime);
      const scheduleEnd = new Date(schedule.endTime);
      
      return (newStart < scheduleEnd && newEnd > scheduleStart);
    });
  };

  const exportSchedule = () => {
    toast({
      title: "Exporting Schedule",
      description: "Schedule export is being prepared...",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Schedule</h1>
          <p className="text-muted-foreground">
            Manage your team's schedule and shift assignments
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={format(selectedDate, 'yyyy-MM-dd')} onValueChange={(value) => setSelectedDate(new Date(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 14 }, (_, i) => {
                const date = addDays(new Date(), i);
                return (
                  <SelectItem key={i} value={format(date, 'yyyy-MM-dd')}>
                    {format(date, 'MMM d')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportSchedule}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          <Dialog open={isCreateShiftOpen} onOpenChange={setIsCreateShiftOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>
                  Assign a new shift to an employee for {format(selectedDate, 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Shift Templates */}
                <div>
                  <Label className="text-base font-medium">Quick Templates</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {SHIFT_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                        onClick={() => handleTemplateSelect(template)}
                        className="justify-start"
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 ${template.color}`} />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee">Employee *</Label>
                    <Select value={newShift.employeeId} onValueChange={(value) => setNewShift({...newShift, employeeId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {employee.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Shift Title *</Label>
                    <Input
                      id="title"
                      value={newShift.title}
                      onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                      placeholder="e.g., Morning Reception"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    />
                  </div>
                </div>

                {newShift.employeeId && newShift.startTime && newShift.endTime && 
                 checkConflicts(newShift.employeeId, 
                   `${format(selectedDate, 'yyyy-MM-dd')}T${newShift.startTime}:00`, 
                   `${format(selectedDate, 'yyyy-MM-dd')}T${newShift.endTime}:00`) && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <p className="text-sm font-medium text-destructive">Schedule Conflict Detected</p>
                    </div>
                    <p className="text-sm text-destructive mt-1">
                      This employee already has a shift during this time period.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newShift.notes}
                    onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                    placeholder="Additional notes or instructions..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateShiftOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateShift}>
                  Create Shift
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedule View */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {viewMode === 'week' ? 'Weekly Schedule' : 
                 viewMode === 'day' ? 'Daily Schedule' : 'Monthly Schedule'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'week' 
                  ? `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                  : format(selectedDate, 'MMMM d, yyyy')
                }
              </CardDescription>
            </div>
            <Badge variant="outline">
              {schedules.length} shifts scheduled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const daySchedules = getDaySchedules(day);
                return (
                  <div key={index} className="border border-border rounded-lg p-3 min-h-40">
                    <div className="text-sm font-medium mb-2">
                      {format(day, 'EEE d')}
                    </div>
                    <div className="space-y-2">
                      {daySchedules.map((schedule) => {
                        const employee = employees.find(e => e.id === schedule.userId);
                        return (
                          <div
                            key={schedule.id}
                            className="p-2 bg-primary/10 border border-primary/20 rounded text-xs"
                          >
                            <div className="font-medium">{schedule.title}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(schedule.startTime), 'HH:mm')} - 
                              {format(new Date(schedule.endTime), 'HH:mm')}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs">
                                  {employee?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{employee?.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-4">
              {getDaySchedules(selectedDate).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No shifts scheduled for this day</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateShiftOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Shift
                  </Button>
                </div>
              ) : (
                getDaySchedules(selectedDate).map((schedule) => {
                  const employee = employees.find(e => e.id === schedule.userId);
                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-full bg-primary rounded-full"></div>
                        <Avatar>
                          <AvatarFallback>
                            {employee?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{schedule.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {employee?.name} • {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                          {schedule.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((employee) => {
                const employeeSchedules = schedules.filter(s => s.userId === employee.id);
                const todaySchedules = employeeSchedules.filter(s => 
                  isSameDay(new Date(s.startTime), new Date())
                );
                
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.jobTitle || 'Team Member'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {todaySchedules.length > 0 ? (
                        <Badge variant="default">
                          On duty today
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Employees</span>
                <span className="font-medium">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Scheduled Today</span>
                <span className="font-medium">
                  {schedules.filter(s => isSameDay(new Date(s.startTime), new Date())).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">{schedules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Coverage</span>
                <Badge variant="default" className="bg-green-500">
                  94%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}