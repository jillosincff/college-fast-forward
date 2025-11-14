import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Briefcase, 
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { JobRequest } from '@/entities/JobRequest';
import { Opportunity } from '@/entities/Opportunity';
import { Message } from '@/entities/Message';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivities = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      setError(null);
      const recentActivities = [];

      // Load recent job requests with timeout and error handling
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const requests = await JobRequest.list('-created_date', 5);
        clearTimeout(timeoutId);
        
        if (Array.isArray(requests) && requests.length > 0) {
          requests.forEach(request => {
            if (request?.created_date) {
              recentActivities.push({
                id: request.id,
                type: 'job_request',
                title: request.role || request.title || 'Job Request',
                description: `New request posted${request.target_industry ? ` in ${request.target_industry}` : ''}`,
                timestamp: request.created_date,
                icon: Briefcase,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
              });
            }
          });
        }
      } catch (error) {
        console.warn('Could not load job requests for activity:', error.message);
      }

      // Load recent opportunities with timeout and error handling
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const opportunities = await Opportunity.list('-created_date', 5);
        clearTimeout(timeoutId);
        
        if (Array.isArray(opportunities) && opportunities.length > 0) {
          opportunities.forEach(opp => {
            if (opp?.created_date) {
              recentActivities.push({
                id: opp.id,
                type: 'opportunity',
                title: opp.title || 'New Opportunity',
                description: `${opp.opportunity_type || 'Position'} at ${opp.company_name || 'Company'}`,
                timestamp: opp.created_date,
                icon: TrendingUp,
                color: 'text-green-600',
                bgColor: 'bg-green-100'
              });
            }
          });
        }
      } catch (error) {
        console.warn('Could not load opportunities for activity:', error.message);
      }

      // Load recent messages with timeout and error handling
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const messages = await Message.filter({ recipient_email: user.email }, '-created_date', 5);
        clearTimeout(timeoutId);
        
        if (Array.isArray(messages) && messages.length > 0) {
          messages.forEach(message => {
            if (message?.created_date) {
              recentActivities.push({
                id: message.id,
                type: 'message',
                title: message.subject || 'New Message',
                description: `From ${message.sender_email || 'Unknown'}`,
                timestamp: message.created_date,
                icon: MessageSquare,
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
                isUnread: !message.is_read
              });
            }
          });
        }
      } catch (error) {
        console.warn('Could not load messages for activity:', error.message);
      }

      // Sort by timestamp and take the most recent 8
      recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivities(recentActivities.slice(0, 8));

    } catch (error) {
      console.error('Failed to load activities:', error);
      setError('Could not load recent activity');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      loadActivities();
    }
  }, [user, loadActivities]);

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return `${Math.floor(diffInSeconds / 604800)}w ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'job_request':
        navigate('Connections');
        break;
      case 'opportunity':
        navigate('Opportunities');
        break;
      case 'message':
        navigate('Messages');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">{error}</p>
            <Button 
              variant="ghost" 
              onClick={loadActivities}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('Dashboard', { tab: 'overview' })}>
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No recent activity</p>
            <p className="text-sm text-slate-400 mt-1">
              Activity will appear here as you use the platform
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className={`p-2 rounded-full ${activity.bgColor}`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.title}
                        {activity.isUnread && (
                          <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">New</Badge>
                        )}
                      </p>
                      <span className="text-xs text-slate-500 ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}