import { useTheme } from '@/contexts/ThemeContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Moon, Sun, Palette, Eye, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Appearance = () => {
  const { 
    mode, 
    colorTheme, 
    previewTheme, 
    setMode, 
    setPreviewTheme, 
    applyPreview, 
    colorThemes 
  } = useTheme();

  const currentTheme = previewTheme || colorTheme;
  const hasPreview = previewTheme !== null;

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-6 px-6 space-y-6 relative">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Appearance</h1>
          <p className="text-muted-foreground">
            Customize how WorkScheduler looks and feels to you.
          </p>
        </div>

        {/* Preview Bar */}
        {hasPreview && (
          <Card className="border-primary/50 bg-primary/5 relative z-10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Preview Mode</p>
                  <p className="text-sm text-muted-foreground">
                    You're previewing the {previewTheme?.name} theme
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPreviewTheme(null)}>
                  Cancel
                </Button>
                <Button onClick={applyPreview}>
                  Apply Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                      "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-colors duration-200",
                      "hover:bg-muted/50",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-lg" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn(
                      "w-8 h-8",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="text-center">
                      <p className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {option.label}
                      </p>
                      {isSelected && (
                        <Badge variant="secondary" className="mt-1">
                          Active
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Color Themes */}
        <Card className="relative z-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Themes
            </CardTitle>
            <CardDescription>
              Choose your preferred color scheme. Hover to preview, click to select.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colorThemes.map((theme) => {
                const isSelected = currentTheme.id === theme.id;
                const isCurrentActive = colorTheme.id === theme.id && !hasPreview;
                
                return (
                  <button
                    key={theme.id}
                    onMouseEnter={() => setPreviewTheme(theme)}
                    onMouseLeave={() => {
                      if (previewTheme?.id === theme.id) {
                        setPreviewTheme(null);
                      }
                    }}
                    onClick={() => setPreviewTheme(theme)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200",
                      "hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
                      "transform-gpu will-change-transform",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {/* Color Preview */}
                    <div className="flex gap-1">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                      />
                    </div>
                    
                    {/* Theme Name */}
                    <div className="text-center">
                      <p className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {theme.name}
                      </p>
                      {isCurrentActive && (
                        <Badge variant="secondary" className="mt-1">
                          <Check className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your customizations look with these sample components.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sample Buttons */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Buttons & Components</h4>
              <div className="flex flex-wrap gap-3">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Sample Card */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Sample Card</h4>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Sample Title</CardTitle>
                  <CardDescription>
                    This is how cards will look with your selected theme.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Content area with muted text and various elements.
                  </p>
                  <div className="flex gap-2">
                    <Badge>Badge 1</Badge>
                    <Badge variant="secondary">Badge 2</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Appearance;