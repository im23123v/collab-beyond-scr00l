import { useTheme, Theme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor, Leaf, Sunset, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const themeIcons: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
  dim: Monitor,
  forest: Leaf,
  sunset: Sunset,
};

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, setTheme, themes } = useTheme();
  const Icon = themeIcons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center'
          )}
        >
          <Icon className="h-5 w-5" />
          {!collapsed && <span>Theme</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((t) => {
          const ItemIcon = themeIcons[t.value];
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex items-center gap-3 cursor-pointer',
                theme === t.value && 'bg-primary/10 text-primary'
              )}
            >
              <ItemIcon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
