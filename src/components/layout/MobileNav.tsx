import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  ListChecks,
  Users,
  Sun,
  Moon,
  Sparkles,
  Monitor,
  Leaf,
  Sunset,
  Repeat,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/21-tasks', icon: ListChecks, label: '21' },
  { path: '/repeat', icon: Repeat, label: 'RepEat' },
  { path: '/goals', icon: Target, label: 'Goals' },
];

const themeIcons: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
  dim: Monitor,
  forest: Leaf,
  sunset: Sunset,
};

export function MobileNav() {
  const { isAdmin } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const ThemeIcon = themeIcons[theme];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/team"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Team</span>
          </NavLink>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-muted-foreground">
            <ThemeIcon className="h-5 w-5" />
            <span className="text-[10px]">Theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
            {themes.map((t) => {
              const ItemIcon = themeIcons[t.value];
              return (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer',
                    theme === t.value && 'bg-primary/10 text-primary'
                  )}
                >
                  <ItemIcon className="h-4 w-4" />
                  <span>{t.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
