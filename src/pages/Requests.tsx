import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar,
  User,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare
} from 'lucide-react';
import { TimeOffRequest, ShiftSwapRequest, User as UserType } from '@/types';
import { mockAPI, mockEmployees } from '@/lib/mockData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RequestWithType extends TimeOffRequest {
  type: 'time-off';
}

interface SwapRequestWithType extends ShiftSwapRequest {
  type: 'shift-swap';
}

type AnyRequest = RequestWithType | SwapRequestWithType;

export default function Requests() {
  const { user } = useAuth();
  const { hasPermission, isManager } = useRole();
  const { toast } = useToast();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const [timeOffData, swapData, employeesData] = await Promise.all([
          mockAPI.getTimeOffRequests(),
          mockAPI.getShiftSwapRequests(),
          mockAPI.getEmployees(),
        ]);

        setTimeOffRequests(timeOffData);
        setShiftSwapRequests(swapData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Failed to load requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleApproveTimeOff = (requestId: string) => {
    setTimeOffRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.id }
          : req
      )
    );
    
    toast({
      title: "Request Approved",
      description: "Time off request has been approved successfully",
    });
  };

  const handleRejectTimeOff = (requestId: string) => {
    setTimeOffRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: user?.id }
          : req
      )
    );
    
    toast({
      title: "Request Rejected",
      description: "Time off request has been rejected",
      variant: "destructive"
    });
  };

  const handleApproveShiftSwap = (requestId: string) => {
    setShiftSwapRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.id }
          : req
      )
    );
    
    toast({
      title: "Shift Swap Approved",
      description: "Shift swap has been approved and schedules updated",
    });
  };

  const handleRejectShiftSwap = (requestId: string) => {
    setShiftSwapRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: user?.id }
          : req
      )
    );
    
    toast({
      title: "Shift Swap Rejected",
      description: "Shift swap request has been rejected",
      variant: "destructive"
    });
  };

  // Combine and filter requests
  const allRequests: AnyRequest[] = [
    ...timeOffRequests.map(req => ({ ...req, type: 'time-off' as const })),
    ...shiftSwapRequests.map(req => ({ ...req, type: 'shift-swap' as const })),
  ];

  const filteredRequests = allRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.type === filterType;
    const requestUserId = request.type === 'time-off' ? request.userId : (request as ShiftSwapRequest).requesterId;
    const matchesSearch = searchTerm === '' || 
      (request.type === 'time-off' && 
       (request as TimeOffRequest).reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      employees.some(emp => 
        (emp.id === requestUserId && emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const reviewedRequests = filteredRequests.filter(req => req.status !== 'pending');

  const getEmployeeName = (userId: string) => {
    return employees.find(emp => emp.id === userId)?.name || 'Unknown Employee';
  };

  const getRequestUserId = (request: AnyRequest) => {
    return request.type === 'time-off' ? request.userId : (request as ShiftSwapRequest).requesterId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const RequestCard = ({ request }: { request: AnyRequest }) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>
                {getEmployeeName(getRequestUserId(request)).split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{getEmployeeName(getRequestUserId(request))}</h3>
                <Badge variant="outline" className="text-xs">
                  {request.type === 'time-off' ? 'Time Off' : 'Shift Swap'}
                </Badge>
              </div>
              
              {request.type === 'time-off' ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {(request as TimeOffRequest).reason}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date((request as TimeOffRequest).startDate), 'MMM d')} - 
                    {format(new Date((request as TimeOffRequest).endDate), 'MMM d, yyyy')}
                  </p>
                  {(request as TimeOffRequest).notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: {(request as TimeOffRequest).notes}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Wants to swap with {getEmployeeName((request as ShiftSwapRequest).targetUserId)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested: {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </p>
                  {(request as ShiftSwapRequest).reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {(request as ShiftSwapRequest).reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(request.status)} text-white border-transparent`}
            >
              {request.status}
            </Badge>
            
            {request.status === 'pending' && hasPermission('can_approve_requests') && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => {
                    if (request.type === 'time-off') {
                      handleApproveTimeOff(request.id);
                    } else {
                      handleApproveShiftSwap(request.id);
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (request.type === 'time-off') {
                      handleRejectTimeOff(request.id);
                    } else {
                      handleRejectShiftSwap(request.id);
                    }
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Submitted {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}</span>
          {request.reviewedAt && (
            <span>
              Reviewed {format(new Date(request.reviewedAt), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Requests</h1>
          <p className="text-muted-foreground">
            {isManager ? 'Manage and approve team requests' : 'View your request history'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="time-off">Time Off</SelectItem>
            <SelectItem value="shift-swap">Shift Swap</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Reviewed ({reviewedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  All requests have been reviewed or there are no new requests to approve.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviewed" className="space-y-4 mt-6">
          {reviewedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Reviewed Requests</h3>
                <p className="text-muted-foreground">
                  Reviewed requests will appear here once you start approving or rejecting them.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewedRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{allRequests.length}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved This Week</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviewedRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}