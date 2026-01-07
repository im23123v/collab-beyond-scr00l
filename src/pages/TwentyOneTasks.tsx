import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Target, CheckCircle2, Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTwentyOneTasks } from '@/hooks/useTwentyOneTasks';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export default function TwentyOneTasks() {
  const { tasks, completions, isLoading, addTask, deleteTask, toggleCompletion } = useTwentyOneTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth, 2026), [selectedMonth]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || tasks.length >= 21) return;
    addTask.mutate({ title: newTaskTitle, description: newTaskDescription || undefined });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setDialogOpen(false);
  };

  const isDayCompleted = (taskId: string, day: number) => {
    return completions.some(c => c.task_id === taskId && c.month_number === selectedMonth && c.day_number === day && c.year === 2026);
  };

  const getMonthCompletionCount = (taskId: string) => {
    return completions.filter(c => c.task_id === taskId && c.month_number === selectedMonth && c.year === 2026).length;
  };

  const getTotalCompletionCount = (taskId: string) => {
    return completions.filter(c => c.task_id === taskId && c.year === 2026).length;
  };

  const totalCompletions = completions.filter(c => c.year === 2026).length;
  const monthCompletions = completions.filter(c => c.month_number === selectedMonth && c.year === 2026).length;
  const maxMonthCompletions = tasks.length * daysInMonth;
  const monthProgressPercent = maxMonthCompletions > 0 ? (monthCompletions / maxMonthCompletions) * 100 : 0;

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedMonth > 1) {
      setSelectedMonth(selectedMonth - 1);
    } else if (direction === 'next' && selectedMonth < 12) {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === 2026;
  const currentDay = today.getDate();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              21 Tasks Challenge
            </h1>
            <p className="text-muted-foreground mt-1">
              Build habits with daily consistency tracking
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={tasks.length >= 21}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task ({tasks.length}/21)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New 21-Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <Button onClick={handleAddTask} className="w-full" disabled={!newTaskTitle.trim()}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{tasks.length}</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{monthCompletions}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{monthProgressPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Month Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Year Total</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Daily Grid */}
          <div className="xl:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Daily Tracking Grid
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => navigateMonth('prev')}
                      disabled={selectedMonth <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => navigateMonth('next')}
                      disabled={selectedMonth >= 12}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Add your first 21-task to get started!
                  </div>
                ) : (
                  <div className="min-w-max">
                    {/* Day Headers */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 sticky top-0 bg-background pb-2">
                      <div className="w-32 shrink-0 font-medium">Task</div>
                      <div className="flex gap-1">
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const isToday = isCurrentMonth && day === currentDay;
                          return (
                            <div 
                              key={day} 
                              className={cn(
                                "w-7 h-6 flex items-center justify-center font-medium rounded",
                                isToday && "bg-primary text-primary-foreground"
                              )}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                      <div className="w-16 text-center shrink-0 font-medium">Done</div>
                      <div className="w-8 shrink-0"></div>
                    </div>

                    {/* Task Rows */}
                    {tasks.map((task) => {
                      const monthCount = getMonthCompletionCount(task.id);
                      const completionPercent = (monthCount / daysInMonth) * 100;
                      
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-1 py-1.5 hover:bg-muted/30 rounded transition-colors"
                        >
                          <div 
                            className="w-32 shrink-0 truncate font-medium text-sm px-2" 
                            title={task.title}
                          >
                            {task.title}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1;
                              const isCompleted = isDayCompleted(task.id, day);
                              const isToday = isCurrentMonth && day === currentDay;
                              const isFuture = isCurrentMonth && day > currentDay;
                              
                              return (
                                <button
                                  key={day}
                                  onClick={() => !isFuture && toggleCompletion.mutate({ 
                                    taskId: task.id, 
                                    monthNumber: selectedMonth, 
                                    dayNumber: day 
                                  })}
                                  disabled={isFuture}
                                  className={cn(
                                    "w-7 h-7 rounded flex items-center justify-center transition-all duration-200",
                                    "border hover:scale-110 active:scale-95",
                                    isCompleted 
                                      ? "bg-green-500 border-green-400 text-white shadow-sm shadow-green-500/30" 
                                      : "bg-muted/50 border-border hover:border-green-400 hover:bg-green-500/10",
                                    isToday && !isCompleted && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                                    isFuture && "opacity-30 cursor-not-allowed hover:scale-100"
                                  )}
                                >
                                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                                </button>
                              );
                            })}
                          </div>
                          <div className="w-16 shrink-0 text-center">
                            <div className={cn(
                              "text-xs font-semibold px-2 py-1 rounded-full inline-block",
                              completionPercent >= 80 
                                ? "bg-green-500/20 text-green-400"
                                : completionPercent >= 50
                                ? "bg-yellow-500/20 text-yellow-400"
                                : completionPercent >= 20
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {monthCount}/{daysInMonth}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => deleteTask.mutate(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-muted/50 border border-border" />
                        <span>Incomplete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-green-500 border border-green-400 flex items-center justify-center text-white">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-muted/50 border border-border ring-2 ring-primary ring-offset-1" />
                        <span>Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-muted/50 border border-border opacity-30" />
                        <span>Future</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PomodoroTimer />
            
            {/* Heat Summary */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {MONTHS[selectedMonth - 1]} Heat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">{monthCompletions}</div>
                  <div className="text-sm text-muted-foreground">Completions this month</div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${monthProgressPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {monthProgressPercent.toFixed(1)}% of month complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Stats */}
            {tasks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Task Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tasks.slice(0, 5).map((task) => {
                    const total = getTotalCompletionCount(task.id);
                    const monthCount = getMonthCompletionCount(task.id);
                    return (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-24" title={task.title}>{task.title}</span>
                        <span className="text-muted-foreground text-xs">
                          {monthCount} / {total} total
                        </span>
                      </div>
                    );
                  })}
                  {tasks.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{tasks.length - 5} more tasks
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
