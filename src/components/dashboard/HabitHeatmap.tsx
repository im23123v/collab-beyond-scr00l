import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHabits } from '@/hooks/useHabits';
import { Plus, Trash2, Flame, Trophy, Target, Zap, Calendar, TrendingUp, Star, Check } from 'lucide-react';
import { format, eachDayOfInterval, isSameDay, parseISO, startOfWeek, getWeek, differenceInDays, isToday, isBefore } from 'date-fns';

interface HabitHeatmapProps {
  userId?: string;
  isAdmin?: boolean;
}

const COLORS = [
  { name: 'Emerald', value: '#10b981', gradient: ['#d1fae5', '#6ee7b7', '#34d399', '#10b981', '#059669'] },
  { name: 'Blue', value: '#3b82f6', gradient: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'] },
  { name: 'Amber', value: '#f59e0b', gradient: ['#fef3c7', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706'] },
  { name: 'Rose', value: '#f43f5e', gradient: ['#ffe4e6', '#fda4af', '#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Violet', value: '#8b5cf6', gradient: ['#ede9fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'] },
  { name: 'Cyan', value: '#06b6d4', gradient: ['#cffafe', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2'] },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitHeatmap({ userId, isAdmin }: HabitHeatmapProps) {
  const { habits, entries, addHabit, deleteHabit, toggleEntry } = useHabits(userId);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0].value);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  // Fixed year 2026 - Jan 1 to Dec 31
  const year2026Start = new Date(2026, 0, 1);
  const year2026End = new Date(2026, 11, 31);
  const today = new Date();

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

  const getColorConfig = (color: string) => {
    return COLORS.find(c => c.value === color) || COLORS[0];
  };

  // Generate all days for 2026
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: year2026Start, end: year2026End });
  }, []);

  // Group days by week for the heatmap grid
  const weeks = useMemo(() => {
    const weeksArray: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    // Add empty slots for days before Jan 1
    const firstDayOfWeek = year2026Start.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    allDays.forEach((day) => {
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    // Fill remaining slots in the last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeksArray.push(currentWeek);
    
    return weeksArray;
  }, [allDays]);

  const getEntriesForHabit = (habitId: string) => {
    return entries.filter(e => e.habit_id === habitId);
  };

  const hasEntryOnDate = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.some(e => e.habit_id === habitId && e.date === dateStr);
  };

  const getEntryCount = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries.find(e => e.habit_id === habitId && e.date === dateStr);
    return entry?.count || 0;
  };

  const calculateStreak = (habitId: string) => {
    const habitEntries = getEntriesForHabit(habitId)
      .map(e => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (habitEntries.length === 0) return { current: 0, longest: 0, total: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = today;

    // Check if there's an entry today or yesterday to start the streak
    const hasToday = habitEntries.some(d => isSameDay(d, today));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hasYesterday = habitEntries.some(d => isSameDay(d, yesterday));

    if (hasToday || hasYesterday) {
      if (!hasToday) checkDate = yesterday;
      
      while (true) {
        const hasEntry = habitEntries.some(d => isSameDay(d, checkDate));
        if (hasEntry) {
          currentStreak++;
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    const sortedDates = [...habitEntries].sort((a, b) => a.getTime() - b.getTime());
    sortedDates.forEach((date, index) => {
      if (index === 0) {
        tempStreak = 1;
      } else {
        const prevDate = sortedDates[index - 1];
        const diff = differenceInDays(date, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    });

    return { 
      current: currentStreak, 
      longest: longestStreak, 
      total: habitEntries.length 
    };
  };

  const getIntensityColor = (habitId: string, date: Date, colorConfig: typeof COLORS[0]) => {
    const hasEntry = hasEntryOnDate(habitId, date);
    const count = getEntryCount(habitId, date);
    
    if (!hasEntry) {
      const isPast = isBefore(date, today) && !isToday(date);
      return isPast ? 'hsl(var(--muted))' : 'hsl(var(--muted) / 0.3)';
    }
    
    // Intensity based on count (1-5 levels)
    const intensity = Math.min(count, 4);
    return colorConfig.gradient[intensity];
  };

  const getCompletionRate = (habitId: string) => {
    const daysPassed = Math.min(differenceInDays(today, year2026Start) + 1, 365);
    const entriesCount = getEntriesForHabit(habitId).length;
    return daysPassed > 0 ? Math.round((entriesCount / daysPassed) * 100) : 0;
  };

  const getMonthPositions = () => {
    const positions: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay) {
        const month = firstValidDay.getMonth();
        if (month !== lastMonth) {
          positions.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return positions;
  };

  const monthPositions = getMonthPositions();

  const getMotivationalMessage = (streak: number, rate: number) => {
    if (streak >= 30) return { message: "🏆 Legendary! 30+ day streak!", color: "text-yellow-500" };
    if (streak >= 14) return { message: "🔥 On fire! 2+ week streak!", color: "text-orange-500" };
    if (streak >= 7) return { message: "⚡ Amazing! Week-long streak!", color: "text-blue-500" };
    if (streak >= 3) return { message: "🌟 Great start! Keep going!", color: "text-green-500" };
    if (rate >= 80) return { message: "💪 Excellent consistency!", color: "text-purple-500" };
    if (rate >= 50) return { message: "👍 Good progress!", color: "text-cyan-500" };
    return { message: "🎯 Every day counts!", color: "text-muted-foreground" };
  };

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Habit Tracker 2026</CardTitle>
            <p className="text-xs text-muted-foreground">Build consistency, track progress</p>
          </div>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-1" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Create New Habit
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Habit Name</Label>
                  <Input
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g., Exercise, Reading, Meditation"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Choose Color Theme</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`relative w-10 h-10 rounded-xl transition-all hover:scale-110 ${
                          newHabitColor === color.value 
                            ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${color.gradient[1]}, ${color.gradient[3]})` 
                        }}
                        onClick={() => setNewHabitColor(color.value)}
                      >
                        {newHabitColor === color.value && (
                          <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {COLORS.find(c => c.value === newHabitColor)?.name} theme selected
                  </p>
                </div>
                <Button 
                  onClick={handleAddHabit} 
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={!newHabitTitle.trim()}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {habits.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">
                {isAdmin ? 'No habits yet' : 'No habits to display'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Create your first habit and start building consistency!' : 'Habits will appear here when created.'}
              </p>
            </div>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit.id);
            const completionRate = getCompletionRate(habit.id);
            const colorConfig = getColorConfig(habit.color);
            const motivation = getMotivationalMessage(streak.current, completionRate);
            const isExpanded = selectedHabit === habit.id || habits.length <= 2;

            return (
              <div 
                key={habit.id} 
                className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <button 
                    className="flex items-center gap-3 flex-1"
                    onClick={() => setSelectedHabit(selectedHabit === habit.id ? null : habit.id)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg ring-2 ring-white/20"
                      style={{ background: `linear-gradient(135deg, ${colorConfig.gradient[2]}, ${colorConfig.gradient[4]})` }}
                    />
                    <span className="font-semibold text-foreground">{habit.title}</span>
                    <Badge variant="secondary" className="gap-1 font-bold" style={{ color: colorConfig.value }}>
                      <Flame className="h-3 w-3" />
                      {streak.current} day streak
                    </Badge>
                  </button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteHabit.mutate(habit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-orange-500">
                      <Flame className="h-4 w-4" />
                      <span className="font-bold text-lg">{streak.current}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Trophy className="h-4 w-4" />
                      <span className="font-bold text-lg">{streak.longest}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Best</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-blue-500">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold text-lg">{streak.total}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-bold text-lg">{completionRate}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rate</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className={motivation.color}>{motivation.message}</span>
                    <span>{streak.total}/365 days</span>
                  </div>
                  <Progress 
                    value={(streak.total / 365) * 100} 
                    className="h-2"
                    style={{ 
                      '--progress-color': colorConfig.gradient[3]
                    } as React.CSSProperties}
                  />
                </div>

                {/* Heatmap Grid */}
                <div className="relative">
                  {/* Month Labels */}
                  <div className="flex mb-1 ml-8">
                    {monthPositions.map((pos, i) => (
                      <div 
                        key={i}
                        className="text-[10px] text-muted-foreground font-medium"
                        style={{ 
                          position: 'absolute',
                          left: `${(pos.weekIndex / weeks.length) * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {pos.month}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1 mt-4">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3px] pr-1">
                      {DAYS.map((day, i) => (
                        <div 
                          key={day} 
                          className="h-[11px] text-[9px] text-muted-foreground flex items-center"
                          style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Heatmap */}
                    <div className="overflow-x-auto pb-2 flex-1">
                      <div className="flex gap-[3px] min-w-max">
                        {weeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIndex) => {
                              if (!day) {
                                return <div key={dayIndex} className="w-[11px] h-[11px]" />;
                              }
                              
                              const hasEntry = hasEntryOnDate(habit.id, day);
                              const isFuture = day > today;
                              const isTodayDate = isToday(day);
                              
                              return (
                                <button
                                  key={day.toISOString()}
                                  className={`w-[11px] h-[11px] rounded-sm transition-all hover:scale-150 hover:z-10 relative ${
                                    isTodayDate ? 'ring-1 ring-primary ring-offset-1' : ''
                                  } ${isFuture ? 'opacity-30' : ''}`}
                                  style={{
                                    backgroundColor: getIntensityColor(habit.id, day, colorConfig),
                                    boxShadow: hasEntry ? `0 0 4px ${colorConfig.gradient[3]}40` : 'none',
                                  }}
                                  title={`${format(day, 'EEEE, MMM d, yyyy')}${hasEntry ? ' ✓ Completed' : isFuture ? ' (Future)' : ' - Not completed'}`}
                                  onClick={() => {
                                    if (isAdmin && !isFuture) {
                                      toggleEntry.mutate({
                                        habitId: habit.id,
                                        date: format(day, 'yyyy-MM-dd'),
                                      });
                                    }
                                  }}
                                  disabled={!isAdmin || isFuture}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-[2px]">
                      {colorConfig.gradient.map((color, i) => (
                        <div 
                          key={i}
                          className="w-[10px] h-[10px] rounded-sm"
                          style={{ backgroundColor: i === 0 ? 'hsl(var(--muted))' : color }}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
