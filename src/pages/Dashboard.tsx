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
import { CheckCircle2, Circle, Target, TrendingUp, Clock, Users, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile, isAdmin, user } = useAuth();
  const { allProfiles } = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<string>('mine');

  // Determine which user's data to show
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

  // Get display name for selected profile
  const getProfileName = () => {
    if (selectedProfile === 'mine') return profile?.display_name || 'User';
    if (selectedProfile === 'overall') return 'Everyone';
    const found = allProfiles.find(p => p.user_id === selectedProfile);
    return found?.display_name || 'User';
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Profile Switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {selectedProfile === 'mine' ? `Welcome back, ${profile?.display_name || 'User'}!` : `${getProfileName()}'s Dashboard`} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {isAdmin && (
            <ProfileSwitcher
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
            />
          )}
        </div>

        {/* Hero Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20">
                  <Circle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{pendingTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{activeGoals.length}</p>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{Math.round(progressPercent)}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Progress Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {todayCompleted} of {todayTasks.length} tasks completed today
                    </span>
                    <span className="text-sm font-medium">
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
                      Overall: {completedTasks} of {totalTasks} tasks
                    </span>
                    <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                Urgent & Important
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">All caught up! 🎉</p>
              ) : (
                <ul className="space-y-2 max-h-[120px] overflow-y-auto">
                  {urgentTasks.slice(0, 5).map(task => (
                    <li key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm truncate">{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <TasksChart tasks={tasks} goals={goals} />

        {/* Habit Heatmap */}
        <HabitHeatmap 
          userId={targetUserId} 
          isAdmin={isAdmin && (selectedProfile === 'mine' || selectedProfile === 'overall')} 
        />

        {/* Overall Daily Heat */}
        <OverallHeatmap 
          userId={targetUserId} 
          isAdmin={isAdmin && (selectedProfile === 'mine' || selectedProfile === 'overall')} 
        />

        {/* Day Scoring */}
        <DayScoring />

        {/* Today's Tasks */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks scheduled for today</p>
            ) : (
              <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                {todayTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      {task.due_time && (
                        <span className="text-xs text-muted-foreground">{task.due_time}</span>
                      )}
                    </div>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          task.signal_priority === 'red'
                            ? '#ef4444'
                            : task.signal_priority === 'orange'
                            ? '#f59e0b'
                            : '#22c55e',
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {isAdmin && selectedProfile === 'mine' && (
          <Card className="glass border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  You're logged in as admin. Use the profile switcher above to view other users' dashboards.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
