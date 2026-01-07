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

      if (existingData) {
        const { error } = await supabase
          .from('twenty_one_task_completions')
          .delete()
          .eq('id', existingData.id);
        if (error) throw error;
        return null;
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
        return data;
      }
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
