import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  count: number;
  created_at: string;
}

export function useHabits(userId?: string) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', targetUserId],
    queryFn: async () => {
      let query = supabase.from('habits').select('*');
      
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['habit_entries', targetUserId],
    queryFn: async () => {
      let query = supabase.from('habit_entries').select('*');
      
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      return data as HabitEntry[];
    },
    enabled: !!user,
  });

  const addHabit = useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: targetUserId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating habit', description: error.message, variant: 'destructive' });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting habit', description: error.message, variant: 'destructive' });
    },
  });

  const toggleEntry = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', date)
        .maybeSingle();

      if (existing) {
        // Delete the entry
        const { error } = await supabase
          .from('habit_entries')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return null;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('habit_entries')
          .insert([{ habit_id: habitId, user_id: targetUserId, date, count: 1 }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_entries'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating habit', description: error.message, variant: 'destructive' });
    },
  });

  return {
    habits,
    entries,
    isLoading: habitsLoading || entriesLoading,
    addHabit,
    deleteHabit,
    toggleEntry,
  };
}
