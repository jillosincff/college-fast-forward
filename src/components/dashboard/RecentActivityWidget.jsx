import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Share2, Clock, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';

export default function RecentActivityWidget({ helpOffers, stories, loading }) {
  const combinedActivity = [
    ...(helpOffers || []).map(offer => ({
      ...offer,
      type: 'help_offer',
      timestamp: offer.created_date,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      title: `Offered help to ${offer.request_creator_email?.split('@')[0] || 'a student'}`,
      subtitle: offer.help_type === 'introduction' ? 'Introduction offer' : 'Career advice'
    })),
    ...(stories || []).map(story => ({
      ...story,
      type: 'story',
      timestamp: story.created_date,
      icon: Share2,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      title: 'Shared your success story',
      subtitle: `${story.story_type} story`
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Activity className="w-6 h-6 text-slate-600" />
          </motion.div>
          <div>
            <div className="text-xl font-bold text-slate-900">Recent Activity</div>
            <div className="text-sm text-slate-600 font-normal">
              Your recent contributions to Gator Nation
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {combinedActivity.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-semibold text-slate-900 mb-2">Get Started</h3>
            <p className="text-slate-600 text-sm mb-4">
              Help a Gator or share your story to see your impact here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {combinedActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                >
                  <div className={`p-2 rounded-full ${activity.bgColor}`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(activity.timestamp)}
                  </div>
                </motion.div>
              );
            })}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full mt-2 text-slate-600 hover:text-slate-900"
              onClick={() => trackEvent('view_all_activity_clicked')}
            >
              View All Activity
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}