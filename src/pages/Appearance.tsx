import { useTheme } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const Appearance = () => {
  const { mode, setMode } = useTheme();

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  // Color options for customization
  const colorOptions = [
    { name: 'Blue', primary: '217 91% 60%', accent: '217 91% 60%', secondary: '217 32% 17%' },
    { name: 'Purple', primary: '262 83% 58%', accent: '262 83% 58%', secondary: '262 32% 17%' },
    { name: 'Green', primary: '142 76% 36%', accent: '142 76% 36%', secondary: '142 32% 17%' },
    { name: 'Orange', primary: '25 95% 53%', accent: '25 95% 53%', secondary: '25 32% 17%' },
    { name: 'Red', primary: '0 84% 60%', accent: '0 84% 60%', secondary: '0 32% 17%' },
    { name: 'Pink', primary: '322 71% 67%', accent: '322 71% 67%', secondary: '322 32% 17%' },
  ];

  const applyCustomColor = (colors: { primary: string; accent: string; secondary: string }) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--secondary', colors.secondary);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
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

              {/* Custom Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Custom Colors
                  </CardTitle>
                  <CardDescription>
                    Choose colors for buttons and theme elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => applyCustomColor({
                          primary: color.primary,
                          accent: color.accent,
                          secondary: color.secondary
                        })}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors duration-200 hover:bg-muted/30"
                      >
                        {/* Color Preview */}
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: `hsl(${color.primary})` }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: `hsl(${color.accent})` }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: `hsl(${color.secondary})` }}
                          />
                        </div>
                        
                        {/* Color Name */}
                        <span className="font-medium text-foreground">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Preview Buttons */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground">Preview</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button>Primary Button</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
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