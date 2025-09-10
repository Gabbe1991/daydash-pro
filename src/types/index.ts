export type UserRole = 'company' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  settings: CompanySettings;
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