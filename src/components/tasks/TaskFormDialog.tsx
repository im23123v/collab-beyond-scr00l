import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (data: Partial<Task>) => void;
  isLoading?: boolean;
}

export function TaskFormDialog({ open, onOpenChange, task, onSave, isLoading }: TaskFormDialogProps) {
  const { isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [signalPriority, setSignalPriority] = useState('green');
  const [quadrant, setQuadrant] = useState('q4');
  const [visibleTo, setVisibleTo] = useState<string[]>(['admin']);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date || '');
      setSignalPriority(task.signal_priority || 'green');
      setQuadrant(task.quadrant || 'q4');
      setVisibleTo(task.visible_to || ['admin']);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setSignalPriority('green');
      setQuadrant('q4');
      setVisibleTo(['admin']);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      id: task?.id,
      title,
      description: description || null,
      due_date: dueDate || null,
      signal_priority: signalPriority,
      quadrant,
      visible_to: visibleTo,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Signal Priority</Label>
              <Select value={signalPriority} onValueChange={setSignalPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="orange">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="red">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Quadrant (Eisenhower Matrix)</Label>
            <Select value={quadrant} onValueChange={setQuadrant}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q1">🔴 Urgent & Important</SelectItem>
                <SelectItem value="q2">🟡 Important, Not Urgent</SelectItem>
                <SelectItem value="q3">🟠 Urgent, Not Important</SelectItem>
                <SelectItem value="q4">🟢 Neither</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isAdmin && (
            <div className="space-y-2">
              <Label>Visible To</Label>
              <Select 
                value={visibleTo.includes('all') ? 'all' : visibleTo.includes('sindh') && visibleTo.includes('amru') ? 'both' : visibleTo[0]} 
                onValueChange={(v) => {
                  if (v === 'all') setVisibleTo(['all']);
                  else if (v === 'both') setVisibleTo(['sindh', 'amru', 'admin']);
                  else if (v === 'sindh') setVisibleTo(['sindh', 'admin']);
                  else if (v === 'amru') setVisibleTo(['amru', 'admin']);
                  else setVisibleTo(['admin']);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Only Me</SelectItem>
                  <SelectItem value="sindh">Sindh</SelectItem>
                  <SelectItem value="amru">Amru</SelectItem>
                  <SelectItem value="both">Sindh & Amru</SelectItem>
                  <SelectItem value="all">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={isLoading || !title.trim()}>
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
