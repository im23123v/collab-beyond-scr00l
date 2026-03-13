import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { Users, User } from 'lucide-react';

interface ProfileSwitcherProps {
  selectedProfile: string;
  onProfileChange: (profileId: string) => void;
}

export function ProfileSwitcher({ selectedProfile, onProfileChange }: ProfileSwitcherProps) {
  const { allProfiles, isLoading } = useProfiles();

  if (isLoading) {
    return null;
  }

  const allowedUsernames = ['vishwa', 'ammulu'];
  const filteredProfiles = allProfiles.filter(p => allowedUsernames.includes(p.username));

  return (
    <Select value={selectedProfile} onValueChange={onProfileChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select profile" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mine">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>My Dashboard</span>
          </div>
        </SelectItem>
        <SelectItem value="overall">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Overall</span>
          </div>
        </SelectItem>
        {filteredProfiles
          .filter(p => p.username !== 'vishwa') // Exclude admin from the list since admin uses "mine"
          .map((profile) => (
            <SelectItem key={profile.id} value={profile.user_id}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
                <span>{profile.display_name}</span>
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
