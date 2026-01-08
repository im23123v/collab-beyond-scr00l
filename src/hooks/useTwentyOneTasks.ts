import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TwentyOneTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  month_number: number;
  day_number: number;
  year: number;
  completed_at: string;
}

export function useTwentyOneTasks(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['twenty_one_tasks', targetUserId],
    queryFn: async () => {
      let query = supabase.from('twenty_one_tasks').select('*');
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return data as TwentyOneTask[];
    },
    enabled: !!user,
  });

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['twenty_one_task_completions', targetUserId],
    queryFn: async () => {
      let query = supabase.from('twenty_one_task_completions').select('*');
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as TaskCompletion[];
    },
    enabled: !!user,
  });

  const addTask = useMutation({
    mutationFn: async (task: { title: string; description?: string }) => {
      const { data, error } = await supabase
        .from('twenty_one_tasks')
        .insert([{ ...task, user_id: targetUserId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twenty_one_tasks'] });
      toast({ title: '21-Task created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating task', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('twenty_one_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twenty_one_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['twenty_one_task_completions'] });
      toast({ title: '21-Task deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ taskId, monthNumber, dayNumber }: { taskId: string; monthNumber: number; dayNumber: number }) => {
      // First check if completion exists
      const { data: existingData, error: fetchError } = await supabase
        .from('twenty_one_task_completions')
        .select('id')
        .eq('task_id', taskId)
        .eq('user_id', targetUserId)
        .eq('month_number', monthNumber)
        .eq('day_number', dayNumber)
        .eq('year', 2026)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result;
      if (existingData) {
        const { error } = await supabase
          .from('twenty_one_task_completions')
          .delete()
          .eq('id', existingData.id);
        if (error) throw error;
        result = null;
      } else {
        const { data, error } = await supabase
          .from('twenty_one_task_completions')
          .insert([{ 
            task_id: taskId, 
            user_id: targetUserId, 
            month_number: monthNumber, 
            day_number: dayNumber,
            year: 2026 
          }])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Auto-update daily heat based on completions for that day
      const dateStr = `2026-${String(monthNumber).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      
      // Count total completions for this day across all tasks
      const { data: dayCompletions, error: countError } = await supabase
        .from('twenty_one_task_completions')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('month_number', monthNumber)
        .eq('day_number', dayNumber)
        .eq('year', 2026);

      if (countError) throw countError;

      // Get total tasks count
      const { data: totalTasks, error: tasksError } = await supabase
        .from('twenty_one_tasks')
        .select('id')
        .eq('user_id', targetUserId);

      if (tasksError) throw tasksError;

      const completionCount = dayCompletions?.length || 0;
      const totalTaskCount = totalTasks?.length || 1;
      
      // Calculate intensity (1-10) based on completion percentage
      const completionPercent = (completionCount / totalTaskCount) * 100;
      let intensity = 0;
      if (completionCount > 0) {
        intensity = Math.min(10, Math.max(1, Math.ceil(completionPercent / 10)));
      }

      // Update daily_heat
      const { data: existingHeat } = await supabase
        .from('daily_heat')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('date', dateStr)
        .maybeSingle();

      if (existingHeat) {
        if (intensity === 0) {
          await supabase.from('daily_heat').delete().eq('id', existingHeat.id);
        } else {
          await supabase.from('daily_heat').update({ intensity }).eq('id', existingHeat.id);
        }
      } else if (intensity > 0) {
        await supabase.from('daily_heat').insert([{ user_id: targetUserId, date: dateStr, intensity }]);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twenty_one_task_completions'] });
      queryClient.invalidateQueries({ queryKey: ['daily_heat'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating completion', description: error.message, variant: 'destructive' });
    },
  });

  return {
    tasks,
    completions,
    isLoading: tasksLoading || completionsLoading,
    addTask,
    deleteTask,
    toggleCompletion,
  };
}
