import { User, Schedule, TimeOffRequest, Analytics, EmployeeAnalytics, ShiftSwapRequest } from '@/types';
import { addDays, subDays, format, addHours } from 'date-fns';

// Mock employees
export const mockEmployees: User[] = [
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.williams@company.com',
    roleId: 'role-employee',
    companyId: 'comp-1',
    managerId: '2',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Sales Associate',
  },
  {
    id: '4',
    name: 'James Rodriguez',
    email: 'james.rodriguez@company.com',
    roleId: 'role-employee',
    companyId: 'comp-1',
    managerId: '2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Customer Support',
  },
  {
    id: '5',
    name: 'Sofia Chen',
    email: 'sofia.chen@company.com',
    roleId: 'role-employee',
    companyId: 'comp-1',
    managerId: '2',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b96db0d5?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Marketing Assistant',
  },
  {
    id: '6',
    name: 'David Thompson',
    email: 'david.thompson@company.com',
    roleId: 'role-employee',
    companyId: 'comp-1',
    managerId: '2',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    jobTitle: 'Operations Assistant',
  },
];

// Mock schedules
export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    userId: '3',
    managerId: '2',
    title: 'Morning Shift',
    startTime: new Date().toISOString(),
    endTime: addHours(new Date(), 8).toISOString(),
    isRecurring: true,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    },
    status: 'active',
    notes: 'Regular morning shift',
    createdAt: subDays(new Date(), 7).toISOString(),
  },
  {
    id: 'sch-2',
    userId: '4',
    managerId: '2',
    title: 'Evening Shift',
    startTime: addHours(new Date(), 4).toISOString(),
    endTime: addHours(new Date(), 12).toISOString(),
    isRecurring: true,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    status: 'active',
    createdAt: subDays(new Date(), 5).toISOString(),
  },
  {
    id: 'sch-3',
    userId: '5',
    managerId: '2',
    title: 'Weekend Shift',
    startTime: addDays(new Date(), 2).toISOString(),
    endTime: addHours(addDays(new Date(), 2), 6).toISOString(),
    isRecurring: true,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [6, 0], // Saturday and Sunday
    },
    status: 'active',
    createdAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: 'sch-4',
    userId: '6',
    managerId: '2',
    title: 'Part-time Shift',
    startTime: addDays(new Date(), 1).toISOString(),
    endTime: addHours(addDays(new Date(), 1), 4).toISOString(),
    isRecurring: false,
    status: 'pending',
    notes: 'Covering for sick leave',
    createdAt: new Date().toISOString(),
  },
];

// Mock time off requests
export const mockTimeOffRequests: TimeOffRequest[] = [
  {
    id: 'tor-1',
    userId: '3',
    managerId: '2',
    startDate: addDays(new Date(), 7).toISOString(),
    endDate: addDays(new Date(), 9).toISOString(),
    reason: 'Family vacation',
    status: 'pending',
    notes: 'Pre-planned family trip',
    createdAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'tor-2',
    userId: '4',
    managerId: '2',
    startDate: addDays(new Date(), 14).toISOString(),
    endDate: addDays(new Date(), 14).toISOString(),
    reason: 'Personal day',
    status: 'approved',
    createdAt: subDays(new Date(), 5).toISOString(),
    reviewedAt: subDays(new Date(), 1).toISOString(),
    reviewedBy: '2',
  },
];

// Mock shift swap requests
export const mockShiftSwapRequests: ShiftSwapRequest[] = [
  {
    id: 'ssr-1',
    requesterId: '3',
    targetUserId: '4',
    requesterShiftId: 'sch-1',
    targetShiftId: 'sch-2',
    status: 'pending',
    reason: 'Doctor appointment conflict',
    createdAt: subDays(new Date(), 1).toISOString(),
  },
];

// Mock analytics data
export const mockAnalytics: Analytics = {
  totalHours: 160,
  overtimeHours: 8,
  timeOffDays: 3,
  pendingRequests: 2,
  completedShifts: 20,
  period: {
    start: subDays(new Date(), 30).toISOString(),
    end: new Date().toISOString(),
  },
};

export const mockEmployeeAnalytics: EmployeeAnalytics[] = [
  {
    userId: '3',
    userName: 'Emma Williams',
    totalHours: 160,
    overtimeHours: 4,
    timeOffDays: 2,
    pendingRequests: 1,
    completedShifts: 20,
    averageHoursPerWeek: 40,
    punctualityScore: 95,
    period: {
      start: subDays(new Date(), 30).toISOString(),
      end: new Date().toISOString(),
    },
  },
  {
    userId: '4',
    userName: 'James Rodriguez',
    totalHours: 168,
    overtimeHours: 8,
    timeOffDays: 1,
    pendingRequests: 0,
    completedShifts: 21,
    averageHoursPerWeek: 42,
    punctualityScore: 88,
    period: {
      start: subDays(new Date(), 30).toISOString(),
      end: new Date().toISOString(),
    },
  },
  {
    userId: '5',
    userName: 'Sofia Chen',
    totalHours: 96,
    overtimeHours: 0,
    timeOffDays: 0,
    pendingRequests: 0,
    completedShifts: 12,
    averageHoursPerWeek: 24,
    punctualityScore: 100,
    period: {
      start: subDays(new Date(), 30).toISOString(),
      end: new Date().toISOString(),
    },
  },
  {
    userId: '6',
    userName: 'David Thompson',
    totalHours: 144,
    overtimeHours: 0,
    timeOffDays: 4,
    pendingRequests: 1,
    completedShifts: 18,
    averageHoursPerWeek: 36,
    punctualityScore: 92,
    period: {
      start: subDays(new Date(), 30).toISOString(),
      end: new Date().toISOString(),
    },
  },
];

// Mock API functions
export const mockAPI = {
  getSchedules: async (userId?: string): Promise<Schedule[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return userId 
      ? mockSchedules.filter(s => s.userId === userId)
      : mockSchedules;
  },

  getTimeOffRequests: async (userId?: string): Promise<TimeOffRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return userId 
      ? mockTimeOffRequests.filter(r => r.userId === userId)
      : mockTimeOffRequests;
  },

  getShiftSwapRequests: async (userId?: string): Promise<ShiftSwapRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return userId 
      ? mockShiftSwapRequests.filter(r => r.requesterId === userId || r.targetUserId === userId)
      : mockShiftSwapRequests;
  },

  getEmployees: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEmployees;
  },

  getAnalytics: async (): Promise<Analytics> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockAnalytics;
  },

  getEmployeeAnalytics: async (): Promise<EmployeeAnalytics[]> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockEmployeeAnalytics;
  }
};