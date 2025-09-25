import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { getLegacyRole } = useRole();

  if (!user) return null;

  const legacyRole = getLegacyRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">
                    {getPageTitle(legacyRole || 'employee')}
                  </h1>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${legacyRole} text-${legacyRole}-foreground`}>
                    {legacyRole?.charAt(0).toUpperCase() + legacyRole?.slice(1)} View
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function getPageTitle(role: string): string {
  const titles = {
    company: 'Company Dashboard',
    manager: 'Manager Dashboard', 
    employee: 'Employee Dashboard',
  };
  return titles[role as keyof typeof titles] || 'Dashboard';
}