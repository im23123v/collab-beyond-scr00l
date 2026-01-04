import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHabits, Habit, HabitEntry } from '@/hooks/useHabits';
import { Plus, Trash2, Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfYear, endOfYear, isSameDay, parseISO } from 'date-fns';

interface HabitHeatmapProps {
  userId?: string;
  isAdmin?: boolean;
}

const COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function HabitHeatmap({ userId, isAdmin }: HabitHeatmapProps) {
  const { habits, entries, addHabit, deleteHabit, toggleEntry } = useHabits(userId);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddHabit = () => {
    if (newHabitTitle.trim()) {
      addHabit.mutate({
        title: newHabitTitle.trim(),
        description: null,
        color: newHabitColor,
      });
      setNewHabitTitle('');
      setDialogOpen(false);
    }
  };

  const getEntriesForHabit = (habitId: string) => {
    return entries.filter(e => e.habit_id === habitId);
  };

  const hasEntryOnDate = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.some(e => e.habit_id === habitId && e.date === dateStr);
  };

  // Generate last 365 days for heatmap
  const today = new Date();
  const startDate = subDays(today, 364);
  const days = eachDayOfInterval({ start: startDate, end: today });

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach((day, index) => {
    if (index > 0 && day.getDay() === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const calculateStreak = (habitId: string) => {
    const habitEntries = getEntriesForHabit(habitId)
      .map(e => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (habitEntries.length === 0) return 0;

    let streak = 0;
    let checkDate = today;

    // Check if there's an entry today or yesterday to start the streak
    const hasToday = habitEntries.some(d => isSameDay(d, today));
    const hasYesterday = habitEntries.some(d => isSameDay(d, subDays(today, 1)));

    if (!hasToday && !hasYesterday) return 0;
    if (!hasToday) checkDate = subDays(today, 1);

    while (true) {
      const hasEntry = habitEntries.some(d => isSameDay(d, checkDate));
      if (hasEntry) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Habit Tracker
        </CardTitle>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Habit Name</Label>
                  <Input
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g., Exercise, Reading, Meditation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          newHabitColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewHabitColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddHabit} className="w-full">
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {habits.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            {isAdmin ? 'No habits yet. Create one to start tracking!' : 'No habits to display.'}
          </p>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="font-medium">{habit.title}</span>
                  <span className="text-sm text-muted-foreground">
                    🔥 {calculateStreak(habit.id)} day streak
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHabit.mutate(habit.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-max">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      {week.map((day) => {
                        const hasEntry = hasEntryOnDate(habit.id, day);
                        return (
                          <button
                            key={day.toISOString()}
                            className="w-3 h-3 rounded-sm transition-all hover:scale-125"
                            style={{
                              backgroundColor: hasEntry ? habit.color : 'hsl(var(--muted))',
                              opacity: hasEntry ? 1 : 0.3,
                            }}
                            title={`${format(day, 'MMM d, yyyy')}${hasEntry ? ' ✓' : ''}`}
                            onClick={() => {
                              if (isAdmin) {
                                toggleEntry.mutate({
                                  habitId: habit.id,
                                  date: format(day, 'yyyy-MM-dd'),
                                });
                              }
                            }}
                            disabled={!isAdmin}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Month labels */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
