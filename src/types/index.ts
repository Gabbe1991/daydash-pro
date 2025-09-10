// Permission types
export type Permission = 
  | 'can_approve_requests'
  | 'can_assign_shifts'
  | 'can_view_analytics'
  | 'can_manage_roles'
  | 'can_manage_departments'
  | 'can_create_accounts'
  | 'can_delete_accounts'
  | 'can_view_company_analytics'
  | 'can_edit_schedules'
  | 'can_view_all_employees'
  | 'can_manage_unavailability'
  | 'can_swap_shifts'
  | 'can_request_time_off';

// Role types
export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  isDefault: boolean; // Default roles cannot be deleted
  isSystemDefined: boolean; // System roles like Company Admin
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Department types
export interface Department {  
  id: string;
  name: string;
  description?: string;
  companyId: string;
  managerId?: string;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

// Enhanced User interface
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string; // Reference to Role
  companyId: string;
  departmentId?: string;
  managerId?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

// Legacy role type for backward compatibility
export type UserRole = 'company' | 'manager' | 'employee';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  settings: CompanySettings;
  adminUserId: string; // Company Admin user ID
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
}

export interface CompanySettings {
  timeZone: string;
  workWeekStart: number; // 0 = Sunday, 1 = Monday
  defaultShiftDuration: number; // in hours
  allowShiftSwapping: boolean;
  requireManagerApproval: boolean;
}

export interface Schedule {
  id: string;
  userId: string;
  managerId: string;
  title: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  status: 'active' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // for weekly patterns
  endDate?: string;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  managerId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  requesterShiftId: string;
  targetShiftId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Analytics {
  totalHours: number;
  overtimeHours: number;
  timeOffDays: number;
  pendingRequests: number;
  completedShifts: number;
  period: {
    start: string;
    end: string;
  };
}

export interface EmployeeAnalytics extends Analytics {
  userId: string;
  userName: string;
  averageHoursPerWeek: number;
  punctualityScore: number;
}

export interface UnavailabilityPeriod {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}