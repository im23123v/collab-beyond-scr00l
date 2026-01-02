import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Goals() {
  const { goals, isLoading, addGoal, updateGoal, deleteGoal } = useGoals();
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState('5');
  const [goalType, setGoalType] = useState('weekly');

  const currentYear = new Date().getFullYear();
  const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const currentMonth = new Date().getMonth() + 1;

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal.mutate({
      title,
      target_count: parseInt(targetCount) || 5,
      completed_count: 0,
      goal_type: goalType,
      week_number: goalType === 'weekly' ? currentWeek : null,
      month_number: goalType === 'monthly' ? currentMonth : null,
      year: currentYear,
    });
    setTitle('');
    setTargetCount('5');
  };

  const incrementGoal = (goal: typeof goals[0]) => {
    if (goal.completed_count < goal.target_count) {
      updateGoal.mutate({ id: goal.id, completed_count: goal.completed_count + 1 });
    }
  };

  const decrementGoal = (goal: typeof goals[0]) => {
    if (goal.completed_count > 0) {
      updateGoal.mutate({ id: goal.id, completed_count: goal.completed_count - 1 });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Track your weekly & monthly goals</p>
        </div>

        {/* Add Goal */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Goal title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Target"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  className="w-full sm:w-24"
                  min="1"
                />
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="gradient-primary w-full sm:w-auto" disabled={addGoal.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map(goal => {
            const progress = (goal.completed_count / goal.target_count) * 100;
            const isComplete = goal.completed_count >= goal.target_count;
            
            return (
              <Card key={goal.id} className={`glass animate-slide-up ${isComplete ? 'border-success/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {goal.goal_type}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(goal.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Progress value={progress} className="h-2 mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {goal.completed_count} / {goal.target_count}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => decrementGoal(goal)} disabled={goal.completed_count === 0}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => incrementGoal(goal)} disabled={isComplete}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No goals yet. Set one above!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
