import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface DayRating {
  id: string;
  user_id: string;
  rated_by: string;
  date: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function useDayRatings(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get all ratings for a user
  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['day_ratings', targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('day_ratings')
        .select('*')
        .or(`user_id.eq.${targetUserId},rated_by.eq.${targetUserId}`)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as DayRating[];
    },
    enabled: !!user && !!targetUserId,
  });

  // Get today's ratings
  const todayRatings = ratings.filter(r => r.date === today);
  const myRatingForToday = todayRatings.find(r => r.user_id === user?.id && r.rated_by === user?.id);
  const ratingsFromOthers = todayRatings.filter(r => r.user_id === user?.id && r.rated_by !== user?.id);
  const myRatingsForOthers = todayRatings.filter(r => r.rated_by === user?.id && r.user_id !== user?.id);

  const rateDay = useMutation({
    mutationFn: async ({ 
      targetUserId: rateUserId, 
      rating, 
      comment 
    }: { 
      targetUserId: string; 
      rating: number; 
      comment?: string;
    }) => {
      // Check if rating already exists
      const { data: existing } = await supabase
        .from('day_ratings')
        .select('*')
        .eq('user_id', rateUserId)
        .eq('rated_by', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing rating
        const { data, error } = await supabase
          .from('day_ratings')
          .update({ rating, comment })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Create new rating
        const { data, error } = await supabase
          .from('day_ratings')
          .insert([{
            user_id: rateUserId,
            rated_by: user?.id,
            date: today,
            rating,
            comment,
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day_ratings'] });
      toast({ title: 'Rating saved!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving rating', description: error.message, variant: 'destructive' });
    },
  });

  return {
    ratings,
    todayRatings,
    myRatingForToday,
    ratingsFromOthers,
    myRatingsForOthers,
    isLoading,
    rateDay,
    today,
  };
}
