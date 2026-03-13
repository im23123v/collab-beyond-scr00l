import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  const { user, isAdmin, profile } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles', user?.id, isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!user,
  });

  // Filter out deactivated users (sindh, vinay) - only vishwa and ammulu are active
  const activeProfiles = profiles.filter(p => ['vishwa', 'ammulu'].includes(p.username));

  const visibleProfiles = isAdmin 
    ? activeProfiles 
    : activeProfiles.filter(p => p.user_id === user?.id || p.username === 'vishwa');

  // Get admin profile for chat
  const adminProfile = profiles.find(p => p.username === 'vishwa') || profiles.find(p => p.display_name?.toLowerCase() === 'vishwa');

  return {
    profiles: visibleProfiles,
    allProfiles: profiles,
    adminProfile,
    isLoading,
  };
}
