import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { EisenhowerMatrix } from '@/components/tasks/EisenhowerMatrix';

export default function Tasks() {
  const { user, isAdmin } = useAuth();
  const { tasks, isLoading, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const { allProfiles } = useProfiles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

  // Create a map of user_id to display_name
  const creatorNames: Record<string, string> = {};
  allProfiles.forEach(p => {
    creatorNames[p.user_id] = p.display_name;
  });

  const handleSave = (data: Partial<Task>) => {
    if (data.id) {
      updateTask.mutate(data as Task);
    } else {
      addTask.mutate({
        title: data.title!,
        description: data.description || null,
        is_completed: false,
        priority: 'medium',
        due_date: data.due_date || null,
        due_time: null,
        is_temp_task: false,
        deadline_at: null,
        task_type: 'daily',
        week_number: null,
        month_number: null,
        year: null,
        visible_to: data.visible_to || ['admin'],
        signal_priority: data.signal_priority || 'green',
        quadrant: data.quadrant || 'q4',
      });
    }
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleToggle = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, is_completed: completed });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage your daily tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'matrix' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('matrix')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }} 
              className="gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {viewMode === 'matrix' ? (
          <EisenhowerMatrix
            tasks={tasks}
            creatorNames={creatorNames}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-3">
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  creatorName={creatorNames[task.user_id]}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {pendingTasks.length === 0 && !isLoading && (
                <Card className="glass">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No pending tasks. Add one to get started!
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-3">
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  creatorName={creatorNames[task.user_id]}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {completedTasks.length === 0 && (
                <Card className="glass">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No completed tasks yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          onSave={handleSave}
          isLoading={addTask.isPending || updateTask.isPending}
        />
      </div>
    </AppLayout>
  );
}
