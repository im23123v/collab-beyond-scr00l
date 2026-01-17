import { useState } from 'react';
import { useDayRatings } from '@/hooks/useDayRatings';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const AMRU_ID = '08369e71-ad89-478e-85b5-86be96661f0d';
const VISHWA_ID = '1a42f133-7129-41dc-ae20-f50bb4696923';

export function DayScoring() {
  const { user, isAdmin } = useAuth();
  const { allProfiles } = useProfiles();
  const { myRatingForToday, ratingsFromOthers, myRatingsForOthers, rateDay, today } = useDayRatings();
  
  const [selfRating, setSelfRating] = useState(myRatingForToday?.rating || 0);
  const [selfComment, setSelfComment] = useState(myRatingForToday?.comment || '');
  const [peerRating, setPeerRating] = useState(0);
  const [peerComment, setPeerComment] = useState('');

  // Determine who the peer is
  const peerId = user?.id === VISHWA_ID ? AMRU_ID : VISHWA_ID;
  const peerProfile = allProfiles.find(p => p.user_id === peerId);
  const myRatingForPeer = myRatingsForOthers.find(r => r.user_id === peerId);
  const peerRatingForMe = ratingsFromOthers.find(r => r.rated_by === peerId);

  const handleSelfRate = () => {
    if (selfRating === 0 || !user) return;
    rateDay.mutate({ targetUserId: user.id, rating: selfRating, comment: selfComment || undefined });
  };

  const handlePeerRate = () => {
    if (peerRating === 0) return;
    rateDay.mutate({ targetUserId: peerId, rating: peerRating, comment: peerComment || undefined });
  };

  const StarRating = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-default"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          Day Scoring — {format(new Date(), 'MMMM d')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Self Rating */}
        <div className="p-4 rounded-lg bg-muted/50">
          <h3 className="font-medium mb-3">Rate Your Day</h3>
          {myRatingForToday ? (
            <div className="space-y-2">
              <StarRating value={myRatingForToday.rating} onChange={() => {}} disabled />
              {myRatingForToday.comment && (
                <p className="text-sm text-muted-foreground italic">"{myRatingForToday.comment}"</p>
              )}
              <p className="text-xs text-muted-foreground">You've rated your day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <StarRating value={selfRating} onChange={setSelfRating} />
              <div className="flex gap-2">
                <Input
                  placeholder="How was your day? (optional)"
                  value={selfComment}
                  onChange={(e) => setSelfComment(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSelfRate} disabled={selfRating === 0 || rateDay.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Peer Rating */}
        {peerProfile && (
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Rate {peerProfile.display_name}'s Day
            </h3>
            {myRatingForPeer ? (
              <div className="space-y-2">
                <StarRating value={myRatingForPeer.rating} onChange={() => {}} disabled />
                {myRatingForPeer.comment && (
                  <p className="text-sm text-muted-foreground italic">"{myRatingForPeer.comment}"</p>
                )}
                <p className="text-xs text-muted-foreground">You've rated {peerProfile.display_name} today!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <StarRating value={peerRating} onChange={setPeerRating} />
                <div className="flex gap-2">
                  <Input
                    placeholder={`Feedback for ${peerProfile.display_name} (optional)`}
                    value={peerComment}
                    onChange={(e) => setPeerComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handlePeerRate} disabled={peerRating === 0 || rateDay.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating received from peer */}
        {peerRatingForMe && peerProfile && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h3 className="font-medium mb-2 text-primary">
              {peerProfile.display_name} rated your day!
            </h3>
            <div className="flex items-center gap-3">
              <StarRating value={peerRatingForMe.rating} onChange={() => {}} disabled />
              {peerRatingForMe.comment && (
                <p className="text-sm text-muted-foreground italic">"{peerRatingForMe.comment}"</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
