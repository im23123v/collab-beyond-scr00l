import { AppLayout } from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const tasksForDate = tasks.filter(t => t.due_date === selectedDateStr);

  const datesWithTasks = tasks
    .filter(t => t.due_date)
    .map(t => new Date(t.due_date!));

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your tasks by date</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardContent className="p-4 flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasTasks: datesWithTasks }}
                modifiersStyles={{
                  hasTasks: { fontWeight: 'bold', textDecoration: 'underline' }
                }}
              />
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksForDate.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tasks for this date</p>
              ) : (
                <ul className="space-y-2">
                  {tasksForDate.map(task => (
                    <li key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {task.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
