import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminRoute, ManagerRoute, AdminManagerRoute, RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AllEmployees from "./pages/AllEmployees";
import CompanySettings from "./pages/CompanySettings";
import Departments from "./pages/Departments";
import RoleManagement from "./pages/RoleManagement";
import DepartmentSchedule from "./pages/DepartmentSchedule";
import Requests from "./pages/Requests";
import MySchedule from "./pages/MySchedule";
import Appearance from "./pages/Appearance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            {/* Routes accessible by all authenticated users */}
            <Route path="/" element={
              <RoleBasedRoute allowedRoles={['role-admin', 'role-manager', 'role-employee']}>
                <Dashboard />
              </RoleBasedRoute>
            } />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/schedule" element={
              <RoleBasedRoute allowedRoles={['role-admin', 'role-manager', 'role-employee']}>
                <MySchedule />
              </RoleBasedRoute>
            } />
            <Route path="/requests" element={
              <RoleBasedRoute allowedRoles={['role-admin', 'role-manager', 'role-employee']}>
                <Requests />
              </RoleBasedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/employees" element={
              <AdminRoute>
                <AllEmployees />
              </AdminRoute>
            } />
            <Route path="/settings" element={
              <AdminRoute>
                <CompanySettings />
              </AdminRoute>
            } />
            <Route path="/roles" element={
              <AdminRoute>
                <RoleManagement />
              </AdminRoute>
            } />
            <Route path="/departments" element={
              <AdminRoute>
                <Departments />
              </AdminRoute>
            } />
            
            {/* Manager-only routes */}
            <Route path="/department-schedule" element={
              <ManagerRoute>
                <DepartmentSchedule />
              </ManagerRoute>
            } />
            
            {/* Admin and Manager routes */}
            <Route path="/analytics" element={
              <AdminManagerRoute>
                <Analytics />
              </AdminManagerRoute>
            } />
            
            {/* Appearance - available to all roles */}
            <Route path="/appearance" element={
              <RoleBasedRoute allowedRoles={['role-admin', 'role-manager', 'role-employee']}>
                <Appearance />
              </RoleBasedRoute>
            } />
            
            {/* Redirects for legacy routes */}
            <Route path="/team" element={<Navigate to="/" replace />} />
            <Route path="/time-off" element={<Navigate to="/" replace />} />
            <Route path="/company" element={<Navigate to="/" replace />} />
            <Route path="/swaps" element={<Navigate to="/requests" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
