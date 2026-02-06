import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRepeatTasks } from '@/hooks/useRepeatTasks';
import { Plus, Trash2, Edit2, Repeat, Sparkles, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
];

const RepEat = () => {
  const { 
    tasks, 
    isLoading, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleCompletion,
    isTaskCompletedToday,
    completedCount,
    totalCount,
    progressPercentage
  } = useRepeatTasks();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', color: '#10b981' });

  const handleSubmit = () => {
    if (!newTask.title.trim()) return;
    
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, ...newTask });
    } else {
      createTask.mutate(newTask);
    }
    
    setNewTask({ title: '', description: '', color: '#10b981' });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description || '', color: task.color || '#10b981' });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this repeating task?')) {
      deleteTask.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Repeat className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  RepEat
                </h1>
                <p className="text-muted-foreground text-sm">
                  Daily habits that stick • {format(new Date(), 'EEEE, MMMM d')}
                </p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                  onClick={() => {
                    setEditingTask(null);
                    setNewTask({ title: '', description: '', color: '#10b981' });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    {editingTask ? 'Edit Habit' : 'New Daily Habit'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Habit Name</Label>
                    <Input
                      placeholder="e.g., Morning meditation..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                      placeholder="Add some details..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all duration-200 hover:scale-110",
                            newTask.color === color && "ring-2 ring-offset-2 ring-offset-background"
                          )}
                          style={{ backgroundColor: color, boxShadow: newTask.color === color ? `0 0 12px ${color}` : 'none' }}
                          onClick={() => setNewTask({ ...newTask, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                    {editingTask ? 'Update' : 'Create'} Habit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Progress Card */}
          <Card className="border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
                    <p className="text-2xl font-bold">
                      {completedCount} <span className="text-muted-foreground text-lg font-normal">/ {totalCount}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    {progressPercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-muted/50"
              />
              {progressPercentage === 100 && totalCount > 0 && (
                <p className="text-center mt-4 text-emerald-500 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Perfect day! All habits completed!
                  <Sparkles className="h-4 w-4" />
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RotateCcw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <Card className="border-dashed border-2 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Repeat className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your daily routine by adding your first habit!
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(true)}
                  className="border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {tasks.map((task) => {
                const isCompleted = isTaskCompletedToday(task.id);
                return (
                  <Card 
                    key={task.id}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg",
                      isCompleted && "bg-gradient-to-r from-emerald-500/5 to-teal-500/5"
                    )}
                    onClick={() => toggleCompletion.mutate(task.id)}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300"
                      style={{ 
                        backgroundColor: task.color || '#10b981',
                        opacity: isCompleted ? 1 : 0.4
                      }}
                    />
                    <CardContent className="p-4 pl-6 flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                            style={{ backgroundColor: task.color || '#10b981' }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div 
                            className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            style={{ borderColor: task.color || '#10b981' }}
                          >
                            <Circle className="h-4 w-4" style={{ color: task.color || '#10b981' }} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold transition-all duration-300",
                          isCompleted && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(task);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RepEat;
