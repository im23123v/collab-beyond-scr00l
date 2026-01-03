import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';

export default function CalendarPage() {
  const { tasks, toggleTask, updateTask } = useTasks();
  const { allProfiles } = useProfiles();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const creatorNames: Record<string, string> = {};
  allProfiles.forEach(p => {
    creatorNames[p.user_id] = p.display_name;
  });

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.due_date === dateStr);
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const tasksForSelectedDate = tasks.filter(t => t.due_date === selectedDateStr);

  const signalColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSave = (data: Partial<Task>) => {
    if (data.id) {
      updateTask.mutate(data as Task);
    }
    setDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your tasks by date</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <Card className="glass lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative p-2 min-h-[80px] md:min-h-[100px] rounded-lg text-left transition-all border",
                        isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/50",
                        !isCurrentMonth && "opacity-40",
                        isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Task Indicators */}
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "text-xs truncate px-1 py-0.5 rounded flex items-center gap-1",
                              task.is_completed ? "bg-muted/50 line-through" : "bg-primary/10"
                            )}
                          >
                            <div 
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                signalColors[task.signal_priority as keyof typeof signalColors] || signalColors.green
                              )}
                            />
                            <span className="truncate hidden md:inline">{task.title}</span>
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayTasks.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Tasks */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No tasks scheduled for this day
                </p>
              ) : (
                tasksForSelectedDate.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask.mutate({ id: task.id, is_completed: !task.is_completed });
                      }}
                      className="mt-0.5"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            signalColors[task.signal_priority as keyof typeof signalColors] || signalColors.green
                          )}
                        />
                        <span className={cn(
                          "font-medium truncate",
                          task.is_completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </span>
                      </div>
                      {creatorNames[task.user_id] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by {creatorNames[task.user_id]}
                        </p>
                      )}
                      {task.quadrant && task.quadrant !== 'q4' && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {task.quadrant === 'q1' && '🔴 Urgent & Important'}
                          {task.quadrant === 'q2' && '🟡 Important'}
                          {task.quadrant === 'q3' && '🟠 Urgent'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          onSave={handleSave}
        />
      </div>
    </AppLayout>
  );
}
