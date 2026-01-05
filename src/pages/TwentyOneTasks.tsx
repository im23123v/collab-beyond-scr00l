import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Target, CheckCircle2, Flame } from 'lucide-react';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TwentyOneTasks() {
  const { tasks, completions, isLoading, addTask, deleteTask, toggleCompletion } = useTwentyOneTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || tasks.length >= 21) return;
    addTask.mutate({ title: newTaskTitle, description: newTaskDescription || undefined });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setDialogOpen(false);
  };

  const getCompletionCount = (taskId: string) => {
    return completions.filter(c => c.task_id === taskId).length;
  };

  const isMonthCompleted = (taskId: string, month: number) => {
    return completions.some(c => c.task_id === taskId && c.month_number === month);
  };

  const totalCompletions = completions.length;
  const maxCompletions = tasks.length * 12;
  const progressPercent = maxCompletions > 0 ? (totalCompletions / maxCompletions) * 100 : 0;

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
              Build habits with monthly consistency tracking
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
              <div className="text-3xl font-bold text-green-400">{totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Total Completions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{progressPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Overall Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{21 - tasks.length}</div>
              <div className="text-xs text-muted-foreground">Slots Remaining</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Monthly Tracking Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Add your first 21-task to get started!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Month Headers */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sticky top-0 bg-background pb-2">
                      <div className="w-48 font-medium">Task</div>
                      <div className="flex-1 grid grid-cols-12 gap-1 text-center">
                        {MONTHS.map((month, i) => (
                          <div key={i} className="font-medium">{month}</div>
                        ))}
                      </div>
                      <div className="w-16 text-center">Done</div>
                      <div className="w-8"></div>
                    </div>

                    {/* Task Rows */}
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-48 truncate font-medium text-sm" title={task.title}>
                          {task.title}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-1">
                          {Array.from({ length: 12 }, (_, month) => {
                            const isCompleted = isMonthCompleted(task.id, month + 1);
                            return (
                              <div key={month} className="flex justify-center">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => 
                                    toggleCompletion.mutate({ taskId: task.id, monthNumber: month + 1 })
                                  }
                                  className={cn(
                                    "h-5 w-5 transition-all",
                                    isCompleted && "bg-green-500 border-green-500 text-white"
                                  )}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="w-16 text-center">
                          <span className={cn(
                            "text-sm font-medium px-2 py-1 rounded-full",
                            getCompletionCount(task.id) === 12 
                              ? "bg-green-500/20 text-green-400"
                              : getCompletionCount(task.id) >= 6
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {getCompletionCount(task.id)}/12
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-destructive hover:text-destructive"
                          onClick={() => deleteTask.mutate(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pomodoro Timer Sidebar */}
          <div className="space-y-4">
            <PomodoroTimer />
            
            {/* Heat Summary */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Completion Heat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">{totalCompletions}</div>
                  <div className="text-sm text-muted-foreground">Total monthly completions</div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {progressPercent.toFixed(1)}% of annual goal
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
