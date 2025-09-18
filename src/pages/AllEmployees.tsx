import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Building2,
  Shield,
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { User, Department, Role, EmployeeAnalytics } from '@/types';
import { mockAPI, mockEmployees, mockDepartments, mockRoles } from '@/lib/mockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog';

export default function AllEmployees() {
  const { user } = useAuth();
  const { getLegacyRole, hasPermission } = useRole();
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employeeAnalytics, setEmployeeAnalytics] = useState<EmployeeAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const legacyRole = getLegacyRole();
        const [employeesData, departmentsData, rolesData, analyticsData] = await Promise.all([
          mockAPI.getEmployees(),
          mockAPI.getDepartments(),
          mockAPI.getRoles(),
          mockAPI.getEmployeeAnalytics(),
        ]);

        // Filter employees based on role permissions
        let filteredEmployees = employeesData;
        if (legacyRole === 'manager') {
          // Managers only see employees in their department
          const userDepartment = user?.departmentId;
          filteredEmployees = employeesData.filter(emp => emp.departmentId === userDepartment);
        } else if (legacyRole === 'employee') {
          // Employees only see their own profile
          filteredEmployees = employeesData.filter(emp => emp.id === user?.id);
        }

        setEmployees(filteredEmployees);
        setDepartments(departmentsData);
        setRoles(rolesData);
        setEmployeeAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const legacyRole = getLegacyRole();
  const canCreateAccounts = hasPermission('can_create_accounts');
  const canDeleteAccounts = hasPermission('can_delete_accounts');
  const canManageRoles = hasPermission('can_manage_roles');

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.departmentId === selectedDepartment;
    const matchesRole = selectedRole === 'all' || employee.roleId === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getDepartmentName = (departmentId: string) => {
    return departments.find(dept => dept.id === departmentId)?.name || 'Unknown';
  };

  const getRoleName = (roleId: string) => {
    return roles.find(role => role.id === roleId)?.name || 'Unknown';
  };

  const getEmployeeAnalytics = (employeeId: string) => {
    return employeeAnalytics.find(analytics => analytics.userId === employeeId);
  };

  const handleAddEmployee = (employeeData: Omit<User, 'id' | 'createdAt'>) => {
    const newEmployee: User = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setEmployees([...employees, newEmployee]);
  };

  const handleEditEmployee = (employee: User) => {
    console.log('Edit employee:', employee);
    // TODO: Implement edit employee functionality
  };

  const handleDeleteEmployee = (employee: User) => {
    console.log('Delete employee:', employee);
    // TODO: Implement delete employee functionality
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {legacyRole === 'employee' ? 'My Profile' : 'All Employees'}
          </h1>
          <p className="text-muted-foreground">
            {legacyRole === 'employee' 
              ? 'View and manage your profile information'
              : `Manage employee accounts and assignments (${filteredEmployees.length} total)`
            }
          </p>
        </div>
        {canCreateAccounts && (
          <Button 
            className="bg-gradient-company hover:bg-company/90"
            onClick={() => setIsAddEmployeeOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {legacyRole !== 'employee' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const analytics = getEmployeeAnalytics(employee.id);
          const isCurrentUser = employee.id === user.id;
          
          return (
            <Card key={employee.id} className={`shadow-card transition-all hover:shadow-lg ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {employee.name}
                        {isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getRoleName(employee.roleId)}
                        </Badge>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(employee.isActive)}`}></span>
                      </div>
                    </div>
                  </div>
                  {legacyRole !== 'employee' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        {canManageRoles && (
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                        )}
                        {canDeleteAccounts && employee.id !== user.id && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{getDepartmentName(employee.departmentId)}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {analytics && legacyRole !== 'employee' && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-2">Performance Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="font-medium">{analytics.totalHours}h</p>
                        <p className="text-muted-foreground text-xs">Total Hours</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="font-medium">{analytics.punctualityScore}%</p>
                        <p className="text-muted-foreground text-xs">Punctuality</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="font-medium">{analytics.completedShifts}</p>
                        <p className="text-muted-foreground text-xs">Shifts</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="font-medium">{analytics.averageHoursPerWeek}h</p>
                        <p className="text-muted-foreground text-xs">Avg/Week</p>
                      </div>
                    </div>
                    {analytics.overtimeHours > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="border-warning text-warning text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {analytics.overtimeHours}h overtime
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedDepartment !== 'all' || selectedRole !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No employees have been added yet'
              }
            </p>
            {canCreateAccounts && !searchTerm && selectedDepartment === 'all' && selectedRole === 'all' && (
              <Button onClick={() => setIsAddEmployeeOpen(true)} className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add First Employee
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddEmployee={handleAddEmployee}
        roles={roles}
        departments={departments}
      />
    </div>
  );
}