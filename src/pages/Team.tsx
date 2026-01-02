import { AppLayout } from '@/components/layout/AppLayout';
import { useProfiles } from '@/hooks/useProfiles';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle2, Target } from 'lucide-react';

export default function Team() {
  const { allProfiles } = useProfiles();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Team Overview</h1>
          <p className="text-muted-foreground">Admin view - manage all team members</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProfiles.map(profile => (
            <TeamMemberCard key={profile.id} profile={profile} />
          ))}
        </div>

        {allProfiles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No team members yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TeamMemberCard({ profile }: { profile: any }) {
  const { tasks } = useTasks(profile.user_id);
  const { goals } = useGoals(profile.user_id);

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium">{profile.display_name}</p>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{completedTasks} / {totalTasks} tasks</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>{goals.length} goals</span>
        </div>
      </CardContent>
    </Card>
  );
}
