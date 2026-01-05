import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDailyHeat } from '@/hooks/useDailyHeat';
import { Flame, Thermometer, TrendingUp, Zap } from 'lucide-react';
import { format, eachDayOfInterval, isToday, isBefore } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OverallHeatmapProps {
  userId?: string;
  isAdmin?: boolean;
}

const HEAT_COLORS = [
  'hsl(var(--muted))', // 0 - no heat
  '#22c55e', // 1 - green
  '#84cc16', // 2 - lime  
  '#eab308', // 3 - yellow
  '#f97316', // 4 - orange
  '#ef4444', // 5 - red
  '#dc2626', // 6 - red-600
  '#b91c1c', // 7 - red-700
  '#991b1b', // 8 - red-800
  '#7f1d1d', // 9 - red-900
  '#450a0a', // 10 - max heat
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function OverallHeatmap({ userId, isAdmin }: OverallHeatmapProps) {
  const { heatData, setHeatIntensity } = useDailyHeat(userId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [intensityValue, setIntensityValue] = useState<number>(5);
  const [dialogOpen, setDialogOpen] = useState(false);

  const year2026Start = new Date(2026, 0, 1);
  const year2026End = new Date(2026, 11, 31);
  const today = new Date();

  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: year2026Start, end: year2026End });
  }, []);

  const weeks = useMemo(() => {
    const weeksArray: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
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
    
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeksArray.push(currentWeek);
    
    return weeksArray;
  }, [allDays]);

  const getHeatForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = heatData.find(h => h.date === dateStr);
    return entry?.intensity || 0;
  };

  const getHeatColor = (intensity: number) => {
    return HEAT_COLORS[Math.min(intensity, 10)];
  };

  const handleDayClick = (day: Date) => {
    if (!isAdmin) return;
    const isFuture = day > today;
    if (isFuture) return;
    
    setSelectedDate(day);
    setIntensityValue(getHeatForDate(day) || 5);
    setDialogOpen(true);
  };

  const handleSetHeat = () => {
    if (!selectedDate) return;
    setHeatIntensity.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      intensity: intensityValue,
    });
    setDialogOpen(false);
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

  // Calculate stats
  const totalHeat = heatData.reduce((sum, h) => sum + h.intensity, 0);
  const avgHeat = heatData.length > 0 ? (totalHeat / heatData.length).toFixed(1) : 0;
  const maxHeat = heatData.length > 0 ? Math.max(...heatData.map(h => h.intensity)) : 0;
  const daysLogged = heatData.length;

  return (
    <>
      <Card className="glass overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-lg">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Overall Daily Heat</CardTitle>
              <p className="text-xs text-muted-foreground">Rate your productivity each day (1-10)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-lg">{totalHeat}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Heat</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-yellow-500">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold text-lg">{avgHeat}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Average</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-red-500">
                <Zap className="h-4 w-4" />
                <span className="font-bold text-lg">{maxHeat}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Peak</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-green-500">
                <span className="font-bold text-lg">{daysLogged}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Days</p>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="relative">
            {/* Month Labels */}
            <div className="flex mb-1 ml-8 relative h-4">
              {monthPositions.map((pos, i) => (
                <div 
                  key={i}
                  className="text-[10px] text-muted-foreground font-medium absolute"
                  style={{ 
                    left: `${(pos.weekIndex / weeks.length) * 100}%`,
                  }}
                >
                  {pos.month}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
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
                        
                        const heat = getHeatForDate(day);
                        const isFuture = day > today;
                        const isTodayDate = isToday(day);
                        
                        return (
                          <button
                            key={day.toISOString()}
                            className={`w-[11px] h-[11px] rounded-sm transition-all hover:scale-150 hover:z-10 relative ${
                              isTodayDate ? 'ring-1 ring-primary ring-offset-1' : ''
                            } ${isFuture ? 'opacity-30 cursor-default' : isAdmin ? 'cursor-pointer' : ''}`}
                            style={{
                              backgroundColor: getHeatColor(heat),
                              boxShadow: heat > 0 ? `0 0 4px ${HEAT_COLORS[heat]}40` : 'none',
                            }}
                            title={`${format(day, 'EEEE, MMM d, yyyy')} - Heat: ${heat}/10`}
                            onClick={() => handleDayClick(day)}
                            disabled={isFuture}
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
              <span>Cool</span>
              <div className="flex gap-[2px]">
                {HEAT_COLORS.slice(0, 6).map((color, i) => (
                  <div 
                    key={i}
                    className="w-[10px] h-[10px] rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span>🔥 Hot</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intensity Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Set Heat Intensity
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-6 pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-500">Low</span>
                  <span className="text-4xl font-bold" style={{ color: HEAT_COLORS[intensityValue] }}>
                    {intensityValue}
                  </span>
                  <span className="text-sm text-red-500">High</span>
                </div>

                <Slider
                  value={[intensityValue]}
                  onValueChange={(val) => setIntensityValue(val[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: HEAT_COLORS[i] }}
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  {intensityValue === 0 && "No heat recorded"}
                  {intensityValue >= 1 && intensityValue <= 3 && "🌱 Light day"}
                  {intensityValue >= 4 && intensityValue <= 6 && "⚡ Moderate effort"}
                  {intensityValue >= 7 && intensityValue <= 8 && "🔥 Great productivity!"}
                  {intensityValue >= 9 && "🚀 On fire! Maximum output!"}
                </p>
              </div>

              <Button 
                onClick={handleSetHeat} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500"
              >
                Set Heat Level
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
