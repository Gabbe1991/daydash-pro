import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  FileText
} from 'lucide-react';
import { Schedule, User, ShiftSwapRequest, TimeOffRequest } from '@/types';
import { mockAPI } from '@/lib/mockData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock leave types - in real app, these would come from manager settings
const LEAVE_TYPES = [
  'Sick Leave',
  'Vacation',
  'Personal Leave',
  'Unpaid Leave',
  'Emergency Leave',
  'Family Leave'
];

interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export default function Requests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [coworkers, setCoworkers] = useState<User[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [availableShifts, setAvailableShifts] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedMyShift, setSelectedMyShift] = useState<string>('');
  const [selectedTargetShift, setSelectedTargetShift] = useState<string>('');
  const [swapReason, setSwapReason] = useState('');
  const [leaveType, setLeaveType] = useState<string>('');
  const [leaveStartDate, setLeaveStartDate] = useState<Date | undefined>();
  const [leaveEndDate, setLeaveEndDate] = useState<Date | undefined>();
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    const loadRequestData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [schedulesData, employeesData, swapRequestsData, availableShiftsData] = await Promise.all([
          mockAPI.getSchedules(user.id),
          mockAPI.getEmployees(),
          mockAPI.getShiftSwapRequests(user.id),
          mockAPI.getSchedules(), // All schedules for potential swaps
        ]);

        setSchedules(schedulesData);
        setSwapRequests(swapRequestsData);
        
        // Mock leave requests for now
        setLeaveRequests([]);
        
        // Filter coworkers in same department
        const departmentCoworkers = employeesData.filter(emp => 
          emp.departmentId === user.departmentId && emp.id !== user.id
        );
        setCoworkers(departmentCoworkers);
        
        // Filter available shifts for swapping (from coworkers)
        const coworkerIds = departmentCoworkers.map(c => c.id);
        const swappableShifts = availableShiftsData.filter(shift => 
          coworkerIds.includes(shift.userId) && shift.status === 'active'
        );
        setAvailableShifts(swappableShifts);
      } catch (error) {
        console.error('Failed to load request data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequestData();
  }, [user]);

  const handleRequestSwap = async () => {
    if (!selectedMyShift || !selectedTargetShift || !swapReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const myShift = schedules.find(s => s.id === selectedMyShift);
      const targetShift = availableShifts.find(s => s.id === selectedTargetShift);
      
      if (!myShift || !targetShift) return;

      const newRequest: ShiftSwapRequest = {
        id: `swap-${Date.now()}`,
        requesterId: user!.id,
        targetUserId: targetShift.userId,
        requesterShiftId: selectedMyShift,
        targetShiftId: selectedTargetShift,
        status: 'pending',
        reason: swapReason,
        createdAt: new Date().toISOString(),
      };

      setSwapRequests(prev => [newRequest, ...prev]);
      setIsSwapDialogOpen(false);
      setSelectedMyShift('');
      setSelectedTargetShift('');
      setSwapReason('');

      toast({
        title: "Swap Request Sent",
        description: "Your shift swap request has been submitted for approval.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit swap request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestLeave = async () => {
    if (!leaveType || !leaveStartDate || !leaveEndDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLeaveRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        userId: user!.id,
        leaveType,
        startDate: leaveStartDate.toISOString(),
        endDate: leaveEndDate.toISOString(),
        reason: leaveReason.trim() || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setLeaveRequests(prev => [newLeaveRequest, ...prev]);
      setIsLeaveDialogOpen(false);
      setLeaveType('');
      setLeaveStartDate(undefined);
      setLeaveEndDate(undefined);
      setLeaveReason('');

      toast({
        title: "Leave Request Sent",
        description: "Your leave request has been submitted for approval.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const myActiveShifts = schedules.filter(s => s.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-employee flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Requests</h1>
            <p className="text-muted-foreground">
              Manage your shift swaps and leave requests
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-employee/10">
                <UserCheck className="w-4 h-4 mr-2" />
                Request Shift Swap
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request Shift Swap</DialogTitle>
                <DialogDescription>
                  Choose which of your shifts you'd like to swap with a colleague's shift.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="my-shift">My Shift</Label>
                  <Select value={selectedMyShift} onValueChange={setSelectedMyShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your shift to swap" />
                    </SelectTrigger>
                    <SelectContent>
                      {myActiveShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.title} - {format(new Date(shift.startTime), 'MMM d, h:mm a')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-shift">Colleague's Shift</Label>
                  <Select value={selectedTargetShift} onValueChange={setSelectedTargetShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift to swap with" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableShifts.map((shift) => {
                        const colleague = coworkers.find(c => c.id === shift.userId);
                        return (
                          <SelectItem key={shift.id} value={shift.id}>
                            {colleague?.name} - {shift.title} - {format(new Date(shift.startTime), 'MMM d, h:mm a')}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Swap</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain why you need to swap this shift..."
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSwapDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestSwap}
                    className="flex-1 bg-gradient-employee hover:opacity-90"
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-employee hover:opacity-90">
                <CalendarDays className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>
                  Submit a leave request for approval by your manager.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !leaveStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveStartDate ? format(leaveStartDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarIcon
                          mode="single"
                          selected={leaveStartDate}
                          onSelect={setLeaveStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !leaveEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveEndDate ? format(leaveEndDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarIcon
                          mode="single"
                          selected={leaveEndDate}
                          onSelect={setLeaveEndDate}
                          disabled={(date) => date < (leaveStartDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leave-reason">Reason (Optional)</Label>
                  <Textarea
                    id="leave-reason"
                    placeholder="Additional details about your leave request..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsLeaveDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestLeave}
                    className="flex-1 bg-gradient-employee hover:opacity-90"
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Request History */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="swaps">Shift Swaps</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All My Requests
              </CardTitle>
              <CardDescription>
                Complete history of your shift swaps and leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {swapRequests.length === 0 && leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No requests yet</p>
                  <p className="text-sm">Submit your first shift swap or leave request above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Swap Requests */}
                  {swapRequests.map((request) => {
                    const myShift = schedules.find(s => s.id === request.requesterShiftId);
                    const targetShift = availableShifts.find(s => s.id === request.targetShiftId);
                    const colleague = coworkers.find(c => c.id === request.targetUserId);

                    return (
                      <div key={request.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className="font-medium">Shift Swap Request</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">My Shift</p>
                            <p className="font-medium">{myShift?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {myShift && format(new Date(myShift.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Colleague's Shift</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={colleague?.avatar} />
                                <AvatarFallback className="bg-employee text-employee-foreground text-xs">
                                  {colleague?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium">{colleague?.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {targetShift && format(new Date(targetShift.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>

                        {request.reason && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Reason: </span>
                              {request.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Leave Requests */}
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">Leave Request</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                          <p className="font-medium">{request.leaveType}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {format(new Date(request.startDate), 'MMM d, yyyy')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Reason: </span>
                            {request.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Shift Swap Requests
              </CardTitle>
              <CardDescription>
                Track the status of your shift swap requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {swapRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No swap requests yet</p>
                  <p className="text-sm">Click "Request Shift Swap" to start swapping shifts with colleagues</p>
                </div>
              ) : (
                
                <div className="space-y-4">
                  {swapRequests.map((request) => {
                    const myShift = schedules.find(s => s.id === request.requesterShiftId);
                    const targetShift = availableShifts.find(s => s.id === request.targetShiftId);
                    const colleague = coworkers.find(c => c.id === request.targetUserId);

                    return (
                      <div key={request.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className="font-medium">Shift Swap Request</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">My Shift</p>
                            <p className="font-medium">{myShift?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {myShift && format(new Date(myShift.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Colleague's Shift</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={colleague?.avatar} />
                                <AvatarFallback className="bg-employee text-employee-foreground text-xs">
                                  {colleague?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium">{colleague?.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {targetShift && format(new Date(targetShift.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>

                        {request.reason && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Reason: </span>
                              {request.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Leave Requests
              </CardTitle>
              <CardDescription>
                Track the status of your leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No leave requests yet</p>
                  <p className="text-sm">Click "Request Leave" to submit your first leave request</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">Leave Request</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                          <p className="font-medium">{request.leaveType}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {format(new Date(request.startDate), 'MMM d, yyyy')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Reason: </span>
                            {request.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
