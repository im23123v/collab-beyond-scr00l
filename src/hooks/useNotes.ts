import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes(userId?: string) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', targetUserId],
    queryFn: async () => {
      let query = supabase.from('notes').select('*');
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }
      const { data, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  const addNote = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: targetUserId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating note', description: error.message, variant: 'destructive' });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating note', description: error.message, variant: 'destructive' });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting note', description: error.message, variant: 'destructive' });
    },
  });

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
  };
}
