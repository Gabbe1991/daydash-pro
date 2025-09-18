import { useState } from 'react';
import { Role, Permission, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionsMatrix } from './PermissionsMatrix';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Users, 
  Copy,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

const DEFAULT_PERMISSIONS: Permission[] = [
  'can_approve_requests',
  'can_assign_shifts', 
  'can_view_analytics',
  'can_manage_roles',
  'can_manage_departments',
  'can_create_accounts',
  'can_delete_accounts',
  'can_view_company_analytics',
  'can_edit_schedules',
  'can_view_all_employees',
  'can_manage_unavailability',
  'can_swap_shifts',
  'can_request_time_off'
];

// Mock data - will be replaced with API calls
const mockRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'company_admin',
    displayName: 'Company Admin',
    permissions: DEFAULT_PERMISSIONS,
    isDefault: false,
    isSystemDefined: true,
    companyId: 'comp-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-manager',
    name: 'manager',
    displayName: 'Manager',
    permissions: [
      'can_approve_requests',
      'can_assign_shifts',
      'can_view_analytics',
      'can_edit_schedules',
      'can_view_all_employees',
      'can_manage_unavailability'
    ],
    isDefault: true,
    isSystemDefined: false,
    companyId: 'comp-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-manager-assistant',
    name: 'manager_assistant',
    displayName: 'Manager Assistant',
    permissions: [
      'can_assign_shifts',
      'can_approve_requests',
      'can_edit_schedules'
    ],
    isDefault: true,
    isSystemDefined: false,
    companyId: 'comp-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-employee',
    name: 'employee',
    displayName: 'Employee',
    permissions: [
      'can_swap_shifts',
      'can_request_time_off',
      'can_manage_unavailability'
    ],
    isDefault: true,
    isSystemDefined: false,
    companyId: 'comp-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

interface RoleManagementProps {
  users?: User[];
}

export function RoleManagement({ users = [] }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<Permission[]>([]);
  const { toast } = useToast();

  const getRoleUserCount = (roleId: string) => {
    return users.filter(user => user.roleId === roleId).length;
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim() || !newRoleDisplayName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      displayName: newRoleDisplayName,
      permissions: newRolePermissions,
      isDefault: false,
      isSystemDefined: false,
      companyId: 'comp-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    setIsCreateDialogOpen(false);
    setNewRoleName('');
    setNewRoleDisplayName('');
    setNewRolePermissions([]);
    
    toast({
      title: "Role Created",
      description: `${newRole.displayName} role has been created successfully`,
    });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDisplayName(role.displayName);
    setNewRolePermissions([...role.permissions]);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const updatedRole = {
      ...selectedRole,
      name: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      displayName: newRoleDisplayName,
      permissions: newRolePermissions,
      updatedAt: new Date().toISOString(),
    };

    setRoles(roles.map(role => role.id === selectedRole.id ? updatedRole : role));
    setIsEditDialogOpen(false);
    setSelectedRole(null);
    
    toast({
      title: "Role Updated",
      description: `${updatedRole.displayName} role has been updated successfully`,
    });
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    role: Role | null;
    isOpen: boolean;
  }>({ role: null, isOpen: false });

  const handleDeleteRole = (role: Role) => {
    if (role.isSystemDefined) {
      toast({
        title: "Cannot Delete",
        description: "System-defined roles cannot be deleted. You can clone them instead.",
        variant: "destructive"
      });
      return;
    }

    const userCount = getRoleUserCount(role.id);
    if (userCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This role is assigned to ${userCount} user(s). Please reassign them first.`,
        variant: "destructive"
      });
      return;
    }

    setDeleteConfirmation({ role, isOpen: true });
  };

  const confirmDeleteRole = () => {
    if (!deleteConfirmation.role) return;

    setRoles(roles.filter(r => r.id !== deleteConfirmation.role!.id));
    setDeleteConfirmation({ role: null, isOpen: false });
    
    toast({
      title: "Role Deleted",
      description: `${deleteConfirmation.role.displayName} role has been deleted`,
    });
  };

  const handleCloneRole = (role: Role) => {
    const clonedRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      name: `${role.name}_copy`,
      displayName: `${role.displayName} (Copy)`,
      isDefault: false,
      isSystemDefined: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, clonedRole]);
    toast({
      title: "Role Cloned",
      description: `${clonedRole.displayName} has been created`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Role Management</h2>
          <p className="text-muted-foreground">
            Manage roles and permissions for your organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-company hover:bg-company/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a custom role with specific permissions for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    placeholder="e.g., senior_manager"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role-display-name">Display Name</Label>
                  <Input
                    id="role-display-name"
                    placeholder="e.g., Senior Manager"
                    value={newRoleDisplayName}
                    onChange={(e) => setNewRoleDisplayName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <PermissionsMatrix
                  permissions={newRolePermissions}
                  onChange={setNewRolePermissions}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {role.isSystemDefined ? (
                    <Crown className="w-4 h-4 text-company" />
                  ) : (
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-lg">{role.displayName}</CardTitle>
                </div>
                {role.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              <CardDescription>
                {role.permissions.length} permissions • {getRoleUserCount(role.id)} users
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                {role.permissions.slice(0, 3).map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission.replace('can_', '').replace(/_/g, ' ')}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.permissions.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRole(role)}
                  disabled={role.isSystemDefined}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloneRole(role)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {!role.isSystemDefined && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRole(role)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles">All Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
              <CardDescription>
                Detailed view of all roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {role.isSystemDefined ? (
                            <Crown className="w-4 h-4 text-company" />
                          ) : (
                            <Shield className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">{role.displayName}</div>
                            <div className="text-sm text-muted-foreground">{role.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {role.isSystemDefined && (
                            <Badge variant="secondary">System</Badge>
                          )}
                          {role.isDefault && (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role.permissions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {getRoleUserCount(role.id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            disabled={role.isSystemDefined}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloneRole(role)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {!role.isSystemDefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                View and manage role assignments for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userRole = roles.find(r => r.id === user.roleId);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userRole && (
                            <Badge variant="outline">
                              {userRole.displayName}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Active
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role permissions and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={selectedRole?.isSystemDefined}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-display-name">Display Name</Label>
                <Input
                  id="edit-role-display-name"
                  value={newRoleDisplayName}
                  onChange={(e) => setNewRoleDisplayName(e.target.value)}
                  disabled={selectedRole?.isSystemDefined}
                />
              </div>
            </div>
            <div>
              <Label>Permissions</Label>
              <PermissionsMatrix
                permissions={newRolePermissions}
                onChange={setNewRolePermissions}
                disabled={selectedRole?.isSystemDefined}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={selectedRole?.isSystemDefined}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}