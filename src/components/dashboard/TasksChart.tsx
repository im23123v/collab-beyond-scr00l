import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Task } from '@/hooks/useTasks';
import { Goal } from '@/hooks/useGoals';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';

interface TasksChartProps {
  tasks: Task[];
  goals: Goal[];
}

const COLORS = {
  completed: 'hsl(var(--primary))',
  pending: 'hsl(var(--muted-foreground))',
  q1: '#ef4444',
  q2: '#3b82f6',
  q3: '#f59e0b',
  q4: '#22c55e',
};

export function TasksChart({ tasks, goals }: TasksChartProps) {
  // Weekly task completion data
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const weeklyData = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const completed = tasks.filter(
      (t) => t.is_completed && t.due_date === dayStr
    ).length;
    const total = tasks.filter((t) => t.due_date === dayStr).length;

    return {
      day: format(day, 'EEE'),
      completed,
      pending: total - completed,
      total,
    };
  });

  // Quadrant distribution
  const quadrantData = [
    { name: 'Urgent & Important', value: tasks.filter((t) => t.quadrant === 'q1').length, color: COLORS.q1 },
    { name: 'Important', value: tasks.filter((t) => t.quadrant === 'q2').length, color: COLORS.q2 },
    { name: 'Urgent', value: tasks.filter((t) => t.quadrant === 'q3').length, color: COLORS.q3 },
    { name: 'Neither', value: tasks.filter((t) => t.quadrant === 'q4').length, color: COLORS.q4 },
  ].filter((d) => d.value > 0);

  // Priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter((t) => t.signal_priority === 'red').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter((t) => t.signal_priority === 'orange').length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter((t) => t.signal_priority === 'green').length, color: '#22c55e' },
  ].filter((d) => d.value > 0);

  // Goals progress data
  const goalsData = goals.slice(0, 5).map((goal) => ({
    name: goal.title.length > 15 ? goal.title.slice(0, 15) + '...' : goal.title,
    progress: Math.round((goal.completed_count / goal.target_count) * 100),
    completed: goal.completed_count,
    target: goal.target_count,
  }));

  const chartConfig = {
    completed: { label: 'Completed', color: COLORS.completed },
    pending: { label: 'Pending', color: COLORS.pending },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly Activity */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#completedGradient)"
              />
              <Area
                type="monotone"
                dataKey="pending"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                fill="hsl(var(--muted))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Task Priority Distribution */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No tasks yet</p>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quadrant Distribution */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Eisenhower Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 h-[200px]">
            {[
              { key: 'q1', label: 'Urgent & Important', color: COLORS.q1 },
              { key: 'q2', label: 'Important', color: COLORS.q2 },
              { key: 'q3', label: 'Urgent', color: COLORS.q3 },
              { key: 'q4', label: 'Neither', color: COLORS.q4 },
            ].map((q) => {
              const count = tasks.filter((t) => t.quadrant === q.key).length;
              return (
                <div
                  key={q.key}
                  className="rounded-lg p-3 flex flex-col justify-center items-center"
                  style={{ backgroundColor: `${q.color}20` }}
                >
                  <span className="text-2xl font-bold" style={{ color: q.color }}>
                    {count}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {q.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {goalsData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={goalsData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={80} />
                <ChartTooltip
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.completed}/{data.target} ({data.progress}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No goals yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
