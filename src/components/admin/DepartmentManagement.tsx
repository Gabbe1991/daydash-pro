import { useState } from 'react';
import { Department, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building2, 
  Users, 
  UserCheck,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - will be replaced with API calls
const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Sales',
    description: 'Customer-facing sales team responsible for revenue generation',
    companyId: 'comp-1',
    managerId: '2',
    employeeCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Customer Support',
    description: 'Technical and customer service support team',
    companyId: 'comp-1',
    managerId: '2',
    employeeCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Operations',
    description: 'Day-to-day operations and logistics management',
    companyId: 'comp-1',
    employeeCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockManagers: User[] = [
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    roleId: 'role-manager',
    companyId: 'comp-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    hireDate: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Operations Manager',
  },
  {
    id: '7',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com', 
    roleId: 'role-manager',
    companyId: 'comp-1',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b96db0d5?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    hireDate: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Sales Manager',
  }
];

interface DepartmentManagementProps {
  users?: User[];
}

export function DepartmentManagement({ users = [] }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [newDepartmentManagerId, setNewDepartmentManagerId] = useState<string>('');
  const { toast } = useToast();

  const handleCreateDepartment = () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a department name",
        variant: "destructive"
      });
      return;
    }

    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      name: newDepartmentName,
      description: newDepartmentDescription,
      companyId: 'comp-1',
      managerId: newDepartmentManagerId || undefined,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDepartments([...departments, newDepartment]);
    setIsCreateDialogOpen(false);
    setNewDepartmentName('');
    setNewDepartmentDescription('');
    setNewDepartmentManagerId('');
    
    toast({
      title: "Department Created",
      description: `${newDepartment.name} department has been created successfully`,
    });
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setNewDepartmentName(department.name);
    setNewDepartmentDescription(department.description || '');
    setNewDepartmentManagerId(department.managerId || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = () => {
    if (!selectedDepartment) return;

    const updatedDepartment = {
      ...selectedDepartment,
      name: newDepartmentName,
      description: newDepartmentDescription,
      managerId: newDepartmentManagerId || undefined,
      updatedAt: new Date().toISOString(),
    };

    setDepartments(departments.map(dept => 
      dept.id === selectedDepartment.id ? updatedDepartment : dept
    ));
    setIsEditDialogOpen(false);
    setSelectedDepartment(null);
    
    toast({
      title: "Department Updated",
      description: `${updatedDepartment.name} department has been updated successfully`,
    });
  };

  const handleDeleteDepartment = (department: Department) => {
    if (department.employeeCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This department has ${department.employeeCount} employees. Please reassign them first.`,
        variant: "destructive"
      });
      return;
    }

    setDepartments(departments.filter(d => d.id !== department.id));
    toast({
      title: "Department Deleted",
      description: `${department.name} department has been deleted`,
    });
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No manager assigned';
    const manager = mockManagers.find(m => m.id === managerId);
    return manager ? manager.name : 'Unknown manager';
  };

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Department Management</h2>
          <p className="text-muted-foreground">
            Organize your workforce into departments for better management
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-company hover:bg-company/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to organize your employees
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g., Sales, Marketing, IT"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dept-description">Description</Label>
                <Textarea
                  id="dept-description"
                  placeholder="Brief description of the department's purpose"
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dept-manager">Department Manager</Label>
                <Select value={newDepartmentManagerId} onValueChange={setNewDepartmentManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No manager assigned</SelectItem>
                    {mockManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} - {manager.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDepartment}>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-company flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{departments.length}</div>
                <div className="text-sm text-muted-foreground">Total Departments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-manager flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-employee flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {departments.filter(d => d.managerId).length}
                </div>
                <div className="text-sm text-muted-foreground">With Managers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(totalEmployees / departments.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg per Dept</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-company flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {department.employeeCount} employees
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {department.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {department.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Manager:</span>
                  <span className="font-medium">{getManagerName(department.managerId)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(department.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {department.employeeCount}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDepartment(department)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDepartment(department)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            Comprehensive view of all departments and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-company flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        {department.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {department.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.managerId ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-success" />
                        {getManagerName(department.managerId)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{department.employeeCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(department.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDepartment(department)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-dept-name">Department Name</Label>
              <Input
                id="edit-dept-name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-description">Description</Label>
              <Textarea
                id="edit-dept-description"
                value={newDepartmentDescription}
                onChange={(e) => setNewDepartmentDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-manager">Department Manager</Label>
              <Select value={newDepartmentManagerId} onValueChange={setNewDepartmentManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager assigned</SelectItem>
                  {mockManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDepartment}>Update Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}