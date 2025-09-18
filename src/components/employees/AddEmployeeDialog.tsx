import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Role, Department } from '@/types';
import { UserPlus, Building2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<User, 'id' | 'createdAt'>) => void;
  roles: Role[];
  departments: Department[];
}

export function AddEmployeeDialog({
  isOpen,
  onClose,
  onAddEmployee,
  roles,
  departments,
}: AddEmployeeDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    departmentId: '',
    jobTitle: '',
    hireDate: new Date().toISOString().split('T')[0],
  });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      roleId: '',
      departmentId: '',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
    });
    setSelectedRole(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRoleSelect = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    setSelectedRole(role || null);
    setFormData({ ...formData, roleId });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.roleId || !formData.departmentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name, email, role, and department)",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const newEmployee: Omit<User, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      roleId: formData.roleId,
      companyId: 'comp-1', // This would come from context in real app
      departmentId: formData.departmentId,
      jobTitle: formData.jobTitle.trim() || undefined,
      hireDate: formData.hireDate,
      isActive: true,
      managerId: undefined, // Could be set based on department manager
    };

    onAddEmployee(newEmployee);
    
    const roleName = roles.find(r => r.id === formData.roleId)?.displayName;
    toast({
      title: "Employee Added",
      description: `${formData.name} has been added as ${roleName}`,
    });
    
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Create a new employee account and assign their role and department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.roleId} onValueChange={handleRoleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {role.displayName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Senior Developer, Sales Representative"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Preview */}
          {selectedRole && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Role Permissions Preview</h3>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedRole.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRole.permissions.length} permissions assigned
                    </p>
                  </div>
                  {selectedRole.isSystemDefined && (
                    <Badge variant="secondary">System Role</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.permissions.slice(0, 6).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace('can_', '').replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {selectedRole.permissions.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedRole.permissions.length - 6} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}