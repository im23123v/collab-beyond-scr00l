import { Task } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface EisenhowerMatrixProps {
  tasks: Task[];
  creatorNames: Record<string, string>;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function EisenhowerMatrix({ tasks, creatorNames, onToggle, onDelete, onEdit }: EisenhowerMatrixProps) {
  const quadrants = [
    { id: 'q1', label: 'Urgent & Important', color: 'border-red-500/50 bg-red-500/5', icon: '🔴' },
    { id: 'q2', label: 'Important, Not Urgent', color: 'border-yellow-500/50 bg-yellow-500/5', icon: '🟡' },
    { id: 'q3', label: 'Urgent, Not Important', color: 'border-orange-500/50 bg-orange-500/5', icon: '🟠' },
    { id: 'q4', label: 'Neither', color: 'border-green-500/50 bg-green-500/5', icon: '🟢' },
  ];

  const getTasksForQuadrant = (quadrantId: string) => 
    tasks.filter(t => (t.quadrant || 'q4') === quadrantId && !t.is_completed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((quadrant) => (
        <div 
          key={quadrant.id}
          className={cn(
            "rounded-xl border-2 p-4 min-h-[200px]",
            quadrant.color
          )}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>{quadrant.icon}</span>
            <span>{quadrant.label}</span>
            <span className="text-muted-foreground text-sm ml-auto">
              ({getTasksForQuadrant(quadrant.id).length})
            </span>
          </h3>
          <div className="space-y-2">
            {getTasksForQuadrant(quadrant.id).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                creatorName={creatorNames[task.user_id]}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
            {getTasksForQuadrant(quadrant.id).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
