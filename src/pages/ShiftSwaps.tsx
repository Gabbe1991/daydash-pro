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
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Schedule, User, ShiftSwapRequest } from '@/types';
import { mockAPI } from '@/lib/mockData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ShiftSwaps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [coworkers, setCoworkers] = useState<User[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [availableShifts, setAvailableShifts] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedMyShift, setSelectedMyShift] = useState<string>('');
  const [selectedTargetShift, setSelectedTargetShift] = useState<string>('');
  const [swapReason, setSwapReason] = useState('');

  useEffect(() => {
    const loadSwapData = async () => {
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
        console.error('Failed to load shift swap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSwapData();
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
      setIsRequestDialogOpen(false);
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

  const getStatusIcon = (status: ShiftSwapRequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: ShiftSwapRequest['status']) => {
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
            <h1 className="text-3xl font-bold text-foreground">Shift Swaps</h1>
            <p className="text-muted-foreground">
              Request to swap shifts with your colleagues
            </p>
          </div>
        </div>
        
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-employee hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Request Swap
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
                  onClick={() => setIsRequestDialogOpen(false)}
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
      </div>

      {/* Swap Requests History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            My Swap Requests
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
              <p className="text-sm">Click "Request Swap" to start swapping shifts with colleagues</p>
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
                        <span className="font-medium">Swap Request</span>
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

      {/* Available Colleagues */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Colleagues
          </CardTitle>
          <CardDescription>
            Team members you can request shift swaps with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coworkers.map((colleague) => {
              const colleagueShifts = availableShifts.filter(s => s.userId === colleague.id);
              return (
                <div key={colleague.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={colleague.avatar} />
                      <AvatarFallback className="bg-employee text-employee-foreground">
                        {colleague.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{colleague.name}</p>
                      <p className="text-sm text-muted-foreground">{colleague.jobTitle || 'Team Member'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Upcoming Shifts</p>
                    {colleagueShifts.slice(0, 2).map((shift) => (
                      <div key={shift.id} className="text-xs p-2 bg-muted/30 rounded">
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(shift.startTime), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))}
                    {colleagueShifts.length === 0 && (
                      <p className="text-xs text-muted-foreground">No upcoming shifts</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}