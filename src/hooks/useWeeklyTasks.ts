import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getWeek, getYear } from 'date-fns';

export interface WeeklyTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  week_number: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export function useWeeklyTasks(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;
  const currentWeek = getWeek(new Date());
  const currentYear = getYear(new Date());

  const { data: weeklyTasks = [], isLoading } = useQuery({
    queryKey: ['weekly_tasks', targetUserId, currentWeek, currentYear],
    queryFn: async () => {
      let query = supabase
        .from('weekly_tasks')
        .select('*')
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return data as WeeklyTask[];
    },
    enabled: !!user,
  });

  const addWeeklyTask = useMutation({
    mutationFn: async (task: Pick<WeeklyTask, 'title' | 'description'>) => {
      const { data, error } = await supabase
        .from('weekly_tasks')
        .insert([{
          ...task,
          user_id: targetUserId,
          week_number: currentWeek,
          year: currentYear,
          status: 'todo',
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_tasks'] });
      toast({ title: 'Task added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    },
  });

  const updateWeeklyTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WeeklyTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('weekly_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_tasks'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    },
  });

  const deleteWeeklyTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('weekly_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_tasks'] });
      toast({ title: 'Task deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    },
  });

  const moveTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'todo' | 'in_progress' | 'done' }) => {
      const { data, error } = await supabase
        .from('weekly_tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_tasks'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error moving task', description: error.message, variant: 'destructive' });
    },
  });

  return {
    weeklyTasks,
    isLoading,
    currentWeek,
    currentYear,
    addWeeklyTask,
    updateWeeklyTask,
    deleteWeeklyTask,
    moveTask,
  };
}
