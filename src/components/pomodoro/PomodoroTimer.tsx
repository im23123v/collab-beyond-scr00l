import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Timer, Coffee, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  className?: string;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak' | 'custom';

const TIMER_SETTINGS = {
  work: { duration: 25 * 60, label: 'Focus Time', color: 'from-red-500 to-orange-500' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-500' },
  longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-cyan-500' },
  custom: { duration: 0, label: 'Custom', color: 'from-purple-500 to-pink-500' },
};

// Parse time input like "2h", "30m", "1h30m", "90m"
const parseTimeInput = (input: string): number => {
  const trimmed = input.trim().toLowerCase();
  let totalSeconds = 0;
  
  // Match hours (e.g., "2h")
  const hoursMatch = trimmed.match(/(\d+)\s*h/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1]) * 60 * 60;
  }
  
  // Match minutes (e.g., "30m")
  const minutesMatch = trimmed.match(/(\d+)\s*m/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }
  
  // If just a number, treat as minutes
  if (!hoursMatch && !minutesMatch && /^\d+$/.test(trimmed)) {
    totalSeconds = parseInt(trimmed) * 60;
  }
  
  return totalSeconds;
};

export function PomodoroTimer({ className }: PomodoroTimerProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.work.duration);
  const [baseDuration, setBaseDuration] = useState(TIMER_SETTINGS.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = baseDuration > 0 ? ((baseDuration - timeLeft) / baseDuration) * 100 : 0;

  const handleModeChange = useCallback((newMode: TimerMode) => {
    if (newMode === 'custom') {
      setShowCustomInput(true);
      setMode('custom');
    } else {
      setMode(newMode);
      setTimeLeft(TIMER_SETTINGS[newMode].duration);
      setBaseDuration(TIMER_SETTINGS[newMode].duration);
      setIsRunning(false);
      setShowCustomInput(false);
    }
  }, []);

  const handleCustomTimeSet = () => {
    const seconds = parseTimeInput(customTimeInput);
    if (seconds > 0) {
      setTimeLeft(seconds);
      setBaseDuration(seconds);
      setShowCustomInput(false);
      setIsRunning(false);
    }
  };

  const handleReset = useCallback(() => {
    setTimeLeft(baseDuration);
    setIsRunning(false);
  }, [baseDuration]);

  const handleComplete = useCallback(() => {
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      // After 4 pomodoros, suggest long break
      if ((completedPomodoros + 1) % 4 === 0) {
        handleModeChange('longBreak');
      } else {
        handleModeChange('shortBreak');
      }
    } else {
      handleModeChange('work');
    }
  }, [mode, completedPomodoros, handleModeChange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Title Input */}
        <Input
          placeholder="What are you working on?"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="text-center font-medium"
        />

        {/* Mode Selector */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === 'work' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleModeChange('work')}
          >
            <Flame className="h-3 w-3 mr-1" />
            Focus
          </Button>
          <Button
            variant={mode === 'shortBreak' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleModeChange('shortBreak')}
          >
            <Coffee className="h-3 w-3 mr-1" />
            Short
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleModeChange('longBreak')}
          >
            <Coffee className="h-3 w-3 mr-1" />
            Long
          </Button>
          <Button
            variant={mode === 'custom' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleModeChange('custom')}
          >
            <Clock className="h-3 w-3 mr-1" />
            Custom
          </Button>
        </div>

        {/* Custom Time Input */}
        {showCustomInput && (
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 2h, 30m, 1h30m"
              value={customTimeInput}
              onChange={(e) => setCustomTimeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomTimeSet()}
              className="text-center"
            />
            <Button onClick={handleCustomTimeSet} size="sm">
              Set
            </Button>
          </div>
        )}

        {/* Timer Display */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={553}
                strokeDashoffset={553 - (progress / 100) * 553}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={mode === 'work' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'} stopColor="currentColor" />
                  <stop offset="100%" className={mode === 'work' ? 'text-orange-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-cyan-500'} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {TIMER_SETTINGS[mode].label}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className={cn(
              "w-24 bg-gradient-to-r",
              TIMER_SETTINGS[mode].color
            )}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>

        {/* Completed Pomodoros */}
        <div className="flex items-center justify-center gap-1 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                i < (completedPomodoros % 4) ? "bg-red-500" : "bg-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {completedPomodoros} completed
          </span>
        </div>

        {/* Current Task Display */}
        {taskTitle && (
          <div className="text-center text-sm text-muted-foreground border-t pt-3">
            Working on: <span className="font-medium text-foreground">{taskTitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
