import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Briefcase, 
  Users,
  Search,
  Target
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { JobRequest } from '@/entities/JobRequest';
import { Message } from '@/entities/Message';
import { trackEvent } from '@/components/utils/analytics';

// Import student-specific widgets
import StudentDashboardHeader from './StudentDashboardHeader';
import NetworkSupportWidget from './NetworkSupportWidget';
import ProfileProgressWidget from './ProfileProgressWidget';
import WelcomeCard from './WelcomeCard';
import QuickActionCard from './QuickActionCard';
import ApplicationsWidget from './ApplicationsWidget';
import MyPostsWidget from './MyPostsWidget';
import GettingStartedWidget from './GettingStartedWidget';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myRequests: 0,
    messagesReceived: 0,
    connectionsCount: 0,
    applicationCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const [requests, messages] = await Promise.all([
        JobRequest.filter({ created_by: user.email }, '-created_date', 5),
        Message.filter({ recipient_email: user.email }, '-created_date', 3)
      ]);

      setRecentRequests(requests || []);
      setStats({
        myRequests: requests?.length || 0,
        messagesReceived: messages?.length || 0,
        connectionsCount: requests?.reduce((sum, req) => sum + (req.messages_count || 0), 0) || 0,
        applicationCount: 0 // Will be populated from applications data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const quickActions = [
    {
      title: 'Ask for Help',
      description: 'Post a request to get help from the Gator community',
      icon: Target,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => {
        trackEvent('dashboard_post_request_clicked');
        navigate('PostRequest');
      }
    },
    {
      title: 'Browse Opportunities',
      description: 'Find internships and jobs shared by the community',
      icon: Briefcase,
      color: 'bg-green-50 text-green-600 border-green-200',
      action: () => {
        trackEvent('dashboard_opportunities_clicked');
        navigate('Opportunities');
      }
    },
    {
      title: 'Connect with Gators',
      description: 'Network with alumni and parents who can help',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => {
        trackEvent('dashboard_connections_clicked');
        navigate('Connections');
      }
    },
    {
      title: 'Find a Roommate',
      description: 'Connect with fellow Gators for housing',
      icon: Search,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      action: () => {
        trackEvent('dashboard_roommates_clicked');
        navigate('Roommates');
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <StudentDashboardHeader user={user} stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card - show for new users */}
            {(!user.has_seen_dashboard || user.first_login) && (
              <WelcomeCard user={user} />
            )}
            
            {/* Getting Started Widget - show if profile incomplete */}
            {(!user.onboarding_completed || (user.profile_completion_score || 0) < 70) && (
              <GettingStartedWidget 
                user={user} 
                completionScore={user.profile_completion_score || 0}
              />
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>

            {/* My Recent Requests */}
            <MyPostsWidget requests={recentRequests} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Progress */}
            <ProfileProgressWidget 
              user={user} 
              completionScore={user.profile_completion_score || 0}
            />
            
            {/* Network Support */}
            <NetworkSupportWidget connectionsCount={stats.connectionsCount} />
            
            {/* Applications Widget */}
            <ApplicationsWidget applicationCount={stats.applicationCount} />
          </div>
        </div>
      </div>
    </div>
  );
}