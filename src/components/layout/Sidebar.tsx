import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Calendar,
  MessageCircle,
  Image,
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/21-tasks', icon: ListChecks, label: '21 Tasks' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/timetables', icon: Image, label: 'Timetables' },
];

const adminItems = [
  { path: '/team', icon: Users, label: 'Team' },
];

export function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const items = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">{profile?.display_name}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-muted',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground',
                collapsed && 'justify-center'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <ThemeToggle collapsed={collapsed} />
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center'
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
