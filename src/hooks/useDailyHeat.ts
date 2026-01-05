import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DailyHeat {
  id: string;
  user_id: string;
  date: string;
  intensity: number;
  created_at: string;
}

export function useDailyHeat(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;

  const { data: heatData = [], isLoading } = useQuery({
    queryKey: ['daily_heat', targetUserId],
    queryFn: async () => {
      let query = supabase.from('daily_heat').select('*');
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data as DailyHeat[];
    },
    enabled: !!user,
  });

  const setHeatIntensity = useMutation({
    mutationFn: async ({ date, intensity }: { date: string; intensity: number }) => {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('daily_heat')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('date', date)
        .maybeSingle();

      if (existing) {
        if (intensity === 0) {
          // Delete if intensity is 0
          const { error } = await supabase
            .from('daily_heat')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
          return null;
        } else {
          // Update existing
          const { data, error } = await supabase
            .from('daily_heat')
            .update({ intensity })
            .eq('id', existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      } else if (intensity > 0) {
        // Create new entry
        const { data, error } = await supabase
          .from('daily_heat')
          .insert([{ user_id: targetUserId, date, intensity }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_heat'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error setting heat', description: error.message, variant: 'destructive' });
    },
  });

  return {
    heatData,
    isLoading,
    setHeatIntensity,
  };
}
