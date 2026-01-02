import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  const { tasks, isLoading, addTask, toggleTask, deleteTask } = useTasks();
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask.mutate({
      title: newTitle,
      description: null,
      is_completed: false,
      priority: 'medium',
      due_date: newDate || null,
      due_time: null,
      is_temp_task: false,
      deadline_at: null,
      task_type: 'daily',
      week_number: null,
      month_number: null,
      year: null,
      visible_to: ['admin'],
    });
    setNewTitle('');
    setNewDate('');
  };

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily tasks</p>
        </div>

        {/* Add Task */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Add a new task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1"
              />
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full sm:w-40"
              />
              <Button onClick={handleAdd} className="gradient-primary" disabled={addTask.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Pending ({pendingTasks.length})</h2>
          {pendingTasks.map(task => (
            <Card key={task.id} className="glass animate-slide-up">
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, is_completed: !!checked })}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTask.mutate(task.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg text-muted-foreground">Completed ({completedTasks.length})</h2>
            {completedTasks.map(task => (
              <Card key={task.id} className="glass opacity-60">
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, is_completed: !!checked })}
                  />
                  <p className="flex-1 line-through text-muted-foreground">{task.title}</p>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask.mutate(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
