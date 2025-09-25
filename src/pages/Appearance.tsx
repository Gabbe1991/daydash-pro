import { useTheme } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const Appearance = () => {
  const { mode, setMode } = useTheme();

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Appearance</h1>
                <p className="text-muted-foreground">
                  Customize how WorkScheduler looks and feels to you.
                </p>
              </div>

              {/* Theme Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Theme Mode
                  </CardTitle>
                  <CardDescription>
                    Choose between light and dark themes, or sync with your system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = mode === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => setMode(option.id as any)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors duration-200",
                            "hover:bg-muted/50",
                            isSelected 
                              ? "border-primary bg-primary/10 shadow-lg" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Icon className={cn(
                            "w-12 h-12",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <div className="text-center">
                            <p className={cn(
                              "font-medium text-lg",
                              isSelected ? "text-primary" : "text-foreground"
                            )}>
                              {option.label}
                            </p>
                            {isSelected && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Active
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Appearance;