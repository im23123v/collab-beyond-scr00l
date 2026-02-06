import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface RepeatTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface RepeatTaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  date: string;
  completed_at: string;
}

export const useRepeatTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['repeat-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('repeat_tasks')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as RepeatTask[];
    },
    enabled: !!user,
  });

  const { data: todayCompletions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['repeat-task-completions', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('repeat_task_completions')
        .select('*')
        .eq('date', today);
      
      if (error) throw error;
      return data as RepeatTaskCompletion[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (newTask: { title: string; description?: string; color?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('repeat_tasks')
        .insert({
          user_id: user.id,
          title: newTask.title,
          description: newTask.description || null,
          color: newTask.color || '#10b981',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repeat-tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('repeat_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repeat-tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('repeat_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repeat-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['repeat-task-completions'] });
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const existingCompletion = todayCompletions.find(c => c.task_id === taskId);
      
      if (existingCompletion) {
        const { error } = await supabase
          .from('repeat_task_completions')
          .delete()
          .eq('id', existingCompletion.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('repeat_task_completions')
          .insert({
            task_id: taskId,
            user_id: user.id,
            date: today,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repeat-task-completions'] });
    },
  });

  const isTaskCompletedToday = (taskId: string) => {
    return todayCompletions.some(c => c.task_id === taskId);
  };

  const completedCount = todayCompletions.length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    tasks,
    todayCompletions,
    isLoading: tasksLoading || completionsLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    isTaskCompletedToday,
    completedCount,
    totalCount,
    progressPercentage,
  };
};
