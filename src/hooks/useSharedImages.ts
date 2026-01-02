import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SharedImage {
  id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  image_url: string;
  visible_to: string[];
  created_at: string;
}

export function useSharedImages() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['shared-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SharedImage[];
    },
    enabled: !!user,
  });

  const uploadImage = useMutation({
    mutationFn: async ({ file, title, description, visibleTo }: { 
      file: File; 
      title: string; 
      description?: string;
      visibleTo: string[];
    }) => {
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('shared-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shared-images')
        .getPublicUrl(fileName);

      // Create record
      const { data, error } = await supabase
        .from('shared_images')
        .insert([{
          uploaded_by: user?.id,
          title,
          description,
          image_url: urlData.publicUrl,
          visible_to: visibleTo,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-images'] });
      toast({ title: 'Image uploaded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error uploading image', description: error.message, variant: 'destructive' });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shared_images').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-images'] });
      toast({ title: 'Image deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting image', description: error.message, variant: 'destructive' });
    },
  });

  return {
    images,
    isLoading,
    uploadImage,
    deleteImage,
    isAdmin,
  };
}
