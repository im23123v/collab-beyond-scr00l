import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useProfiles } from '@/hooks/useProfiles';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TasksChart } from '@/components/dashboard/TasksChart';
import { HabitHeatmap } from '@/components/dashboard/HabitHeatmap';
import { OverallHeatmap } from '@/components/dashboard/OverallHeatmap';
import { ProfileSwitcher } from '@/components/dashboard/ProfileSwitcher';
import { DayScoring } from '@/components/dashboard/DayScoring';
import { CheckCircle2, Circle, Target, TrendingUp, Clock, Users, Sparkles, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile, isAdmin, user } = useAuth();
  const { allProfiles } = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<string>('mine');

  const targetUserId = selectedProfile === 'mine' 
    ? user?.id 
    : selectedProfile === 'overall' 
      ? undefined 
      : selectedProfile;

  const { tasks } = useTasks(targetUserId);
  const { goals } = useGoals(targetUserId);

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.due_date === todayStr);
  const todayCompleted = todayTasks.filter(t => t.is_completed).length;

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const activeGoals = goals.filter(g => g.completed_count < g.target_count);
  const urgentTasks = tasks.filter(t => t.quadrant === 'q1' && !t.is_completed);

  const getProfileName = () => {
    if (selectedProfile === 'mine') return profile?.display_name || 'User';
    if (selectedProfile === 'overall') return 'Everyone';
    const found = allProfiles.find(p => p.user_id === selectedProfile);
    return found?.display_name || 'User';
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Beautiful Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 p-6 md:p-8 border border-primary/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {format(new Date(), 'EEEE, MMMM d')}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedProfile === 'mine' 
                  ? `${greeting()}, ${profile?.display_name || 'there'}` 
                  : `${getProfileName()}'s Dashboard`
                } ✨
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {todayTasks.length > 0 
                  ? `You have ${todayTasks.length} tasks today — ${todayCompleted} done!`
                  : "No tasks scheduled today. Enjoy your day!"
                }
              </p>
            </div>
            {isAdmin && (
              <ProfileSwitcher
                selectedProfile={selectedProfile}
                onProfileChange={setSelectedProfile}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: CheckCircle2,
              value: completedTasks,
              label: 'Completed',
              gradient: 'from-primary/15 to-primary/5',
              iconColor: 'text-primary',
              iconBg: 'bg-primary/15',
            },
            {
              icon: Circle,
              value: pendingTasks.length,
              label: 'Pending',
              gradient: 'from-accent/15 to-accent/5',
              iconColor: 'text-accent',
              iconBg: 'bg-accent/15',
            },
            {
              icon: Target,
              value: activeGoals.length,
              label: 'Active Goals',
              gradient: 'from-success/15 to-success/5',
              iconColor: 'text-success',
              iconBg: 'bg-success/15',
            },
            {
              icon: TrendingUp,
              value: `${Math.round(progressPercent)}%`,
              label: 'Progress',
              gradient: 'from-warning/15 to-warning/5',
              iconColor: 'text-warning',
              iconBg: 'bg-warning/15',
            },
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Progress + Urgent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {todayCompleted} of {todayTasks.length} tasks today
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0} 
                    className="h-3" 
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Overall: {completedTasks} of {totalTasks}
                    </span>
                    <span className="text-sm font-semibold text-primary">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
                Urgent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentTasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-muted-foreground text-sm">All caught up!</p>
                </div>
              ) : (
                <ul className="space-y-2 max-h-[130px] overflow-y-auto scrollbar-thin">
                  {urgentTasks.slice(0, 5).map(task => (
                    <li key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/8 border border-destructive/15">
                      <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                      <span className="text-sm truncate">{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <TasksChart tasks={tasks} goals={goals} />

        {/* Heatmaps */}
        <HabitHeatmap 
          userId={targetUserId} 
          isAdmin={isAdmin && (selectedProfile === 'mine' || selectedProfile === 'overall')} 
        />
        <OverallHeatmap 
          userId={targetUserId} 
          isAdmin={isAdmin && (selectedProfile === 'mine' || selectedProfile === 'overall')} 
        />

        {/* Day Scoring */}
        <DayScoring />

        {/* Today's Tasks */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-1">☀️</p>
                <p className="text-muted-foreground text-sm">No tasks scheduled for today</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                {todayTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      {task.due_time && (
                        <span className="text-xs text-muted-foreground">{task.due_time}</span>
                      )}
                    </div>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background"
                      style={{
                        backgroundColor:
                          task.signal_priority === 'red'
                            ? 'hsl(350 65% 55%)'
                            : task.signal_priority === 'orange'
                            ? 'hsl(38 85% 52%)'
                            : 'hsl(160 55% 42%)',
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {isAdmin && selectedProfile === 'mine' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  You're logged in as admin. Use the profile switcher to view other dashboards.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
