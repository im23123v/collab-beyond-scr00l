import { Task } from '@/hooks/useTasks';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, User, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  creatorName?: string;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  draggable?: boolean;
}

export function TaskCard({ task, creatorName, onToggle, onDelete, onEdit, draggable }: TaskCardProps) {
  const signalColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
  };

  const quadrantLabels = {
    q1: 'Urgent & Important',
    q2: 'Important',
    q3: 'Urgent',
    q4: 'Neither',
  };

  return (
    <Card 
      className={cn(
        "glass animate-slide-up cursor-pointer transition-all hover:shadow-md",
        task.is_completed && "opacity-60"
      )}
      onClick={() => onEdit?.(task)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {draggable && (
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
        )}
        
        {/* Signal Priority Indicator */}
        <div 
          className={cn(
            "w-3 h-3 rounded-full shrink-0",
            signalColors[task.signal_priority as keyof typeof signalColors] || signalColors.green
          )}
          title={`Priority: ${task.signal_priority || 'green'}`}
        />
        
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={(checked) => {
            onToggle(task.id, !!checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium truncate", task.is_completed && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.due_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {creatorName && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {creatorName}
              </span>
            )}
            {task.quadrant && task.quadrant !== 'q4' && (
              <Badge variant="outline" className="text-xs py-0 h-5">
                {quadrantLabels[task.quadrant as keyof typeof quadrantLabels]}
              </Badge>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}
