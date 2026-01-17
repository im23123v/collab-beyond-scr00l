import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWeeklyTasks, WeeklyTask } from '@/hooks/useWeeklyTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, ListTodo, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

const COLUMNS: { key: 'todo' | 'in_progress' | 'done'; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'todo', label: 'To Do', icon: <ListTodo className="h-4 w-4" />, color: 'border-blue-500' },
  { key: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'border-orange-500' },
  { key: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'border-green-500' },
];

export default function WeeklyTasks() {
  const { weeklyTasks, isLoading, currentWeek, currentYear, addWeeklyTask, moveTask, deleteWeeklyTask } = useWeeklyTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addWeeklyTask.mutate({ title, description: description || null });
    setTitle('');
    setDescription('');
    setIsOpen(false);
  };

  const getTasksByStatus = (status: 'todo' | 'in_progress' | 'done') => {
    return weeklyTasks.filter((t) => t.status === status);
  };

  const getNextStatus = (current: string): 'todo' | 'in_progress' | 'done' | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'done';
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <ListTodo className="h-7 w-7 text-primary" />
              Weekly Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Week {currentWeek}, {currentYear} — Kanban Board
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Weekly Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button onClick={handleSubmit} className="w-full">
                  Add to To Do
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <Card key={col.key} className={`glass border-t-4 ${col.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {col.icon}
                    {col.label}
                    <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {getTasksByStatus(col.key).length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  {getTasksByStatus(col.key).map((task) => (
                    <div
                      key={task.id}
                      className="group p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getNextStatus(task.status) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => {
                                const next = getNextStatus(task.status);
                                if (next) moveTask.mutate({ id: task.id, status: next });
                              }}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={() => deleteWeeklyTask.mutate(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getTasksByStatus(col.key).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
