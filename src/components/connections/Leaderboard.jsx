
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { TopHelpersList } from './TopHelpers'; // Changed import path

export default function Leaderboard({ className = '' }) {
  const [period, setPeriod] = useState('week');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Mock data to avoid function call issues
      const mockLeaderboard = [
        {
          userId: 'user1',
          user: {
            id: 'user1',
            full_name: 'Sarah Johnson',
            profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            persona: 'alumni'
          },
          offers: 8,
          intros: 12,
          total: 20,
          rank: 1,
          badges: [{
            badge_type: 'super_helper',
            badge_name: 'Super Helper',
            badge_icon: '🌟'
          }]
        },
        {
          userId: 'user2',
          user: {
            id: 'user2',
            full_name: 'Michael Chen',
            profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            persona: 'parent'
          },
          offers: 5,
          intros: 9,
          total: 14,
          rank: 2,
          badges: [{
            badge_type: 'mentor_month',
            badge_name: 'Mentor of the Month',
            badge_icon: '🏆'
          }]
        },
        {
          userId: 'user3',
          user: {
            id: 'user3',
            full_name: 'Lisa Rodriguez',
            profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            persona: 'alumni'
          },
          offers: 7,
          intros: 6,
          total: 13,
          rank: 3,
          badges: [{
            badge_type: 'rising_star',
            badge_name: 'Rising Star',
            badge_icon: '⭐'
          }]
        },
        {
          userId: 'user4',
          user: {
            id: 'user4',
            full_name: 'David Park',
            profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            persona: 'parent'
          },
          offers: 4,
          intros: 7,
          total: 11,
          rank: 4,
          badges: []
        },
        {
          userId: 'user5',
          user: {
            id: 'user5',
            full_name: 'Jennifer Kim',
            profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
            persona: 'alumni'
          },
          offers: 3,
          intros: 5,
          total: 8,
          rank: 5,
          badges: [{
            badge_type: 'rising_star',
            badge_name: 'Rising Star',
            badge_icon: '⭐'
          }]
        }
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThank = (helper) => {
    toast({
      title: '💙 Thanks sent!',
      description: `Your appreciation has been shared with ${helper.user?.full_name}.`
    });
    trackEvent('leaderboard_thank', { 
      helperId: helper.userId, 
      helperName: helper.user?.full_name 
    });
  };

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>🏆 Top Helpers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 py-4">
                <div className="w-8 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gator-orange" />
            Top Helpers
          </CardTitle>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No helpers yet this {period}.</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to help a fellow Gator!</p>
          </div>
        ) : (
          <div className="p-0"> {/* Added a div wrapper with p-0 */}
            <TopHelpersList items={leaderboard} onThank={handleThank} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
