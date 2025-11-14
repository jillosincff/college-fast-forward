
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight
} from 'lucide-react';
import { Opportunity } from '@/entities/Opportunity';
import { JobRequest } from '@/entities/JobRequest';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { RoommatePost } from '@/entities/RoommatePost';
import { useAuth } from '@/components/auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { navigate } from '@/components/utils/navigation';
import MyPostsModal from '@/components/dashboard/MyPostsModal';

export default function AlumniActivityWidget() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showMyPostsModal, setShowMyPostsModal] = useState(false);
  
  // State for all activity data
  const [myPosts, setMyPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading alumni activity for:', user.email);
      
      // Load ALL opportunities created by this user (both manual and shared)
      const [myOpps, myRoommates, myApps, allOpps, allRequests] = await Promise.all([
        Opportunity.filter({ created_by: user.email }, '-created_date', 50),
        RoommatePost.filter({ created_by: user.email }, '-created_date', 5),
        OpportunityApplication.filter({ applicant_id: user.id }, '-created_date', 5),
        Opportunity.filter({}, '-created_date', 200),
        JobRequest.filter({}, '-created_date', 100)
      ]);

      console.log('✅ Loaded opportunities:', myOpps.length);
      console.log('📋 Opportunities:', myOpps.map(o => ({ id: o.id, title: o.title, posting_type: o.posting_type })));

      setMyPosts([...myOpps, ...myRoommates]);
      setApplications(myApps);

      // Load saved items
      const savedOppIds = JSON.parse(localStorage.getItem('gator_saved_opportunities') || '[]');
      const savedRoommateIds = JSON.parse(localStorage.getItem('gator_saved_roommates') || '[]');
      const saved = [
        ...allOpps.filter(opp => savedOppIds.includes(opp.id)),
        ...myRoommates.filter(rm => savedRoommateIds.includes(rm.id))
      ];
      setSavedItems(saved);

      // Create recommendations based on user's field - with null safety
      const userIndustry = user?.industry || 'Marketing';
      const matchingRequests = allRequests.filter(req => 
        req.target_industry?.toLowerCase().includes(userIndustry.toLowerCase())
      ).slice(0, 3);
      
      setRecommendations(matchingRequests);

      // Build recent activity
      const activities = [];
      
      // Recent applications to my posts
      if (myOpps.length > 0 && myOpps[0].applications_count > 0) {
        activities.push({
          icon: '💼',
          text: `Your ${myOpps[0].title} post received ${myOpps[0].applications_count} new applications`,
          time: myOpps[0].updated_date || myOpps[0].created_date
        });
      }
      
      // Recent housing inquiries
      if (myRoommates.length > 0 && myRoommates[0].applications_count > 0) {
        activities.push({
          icon: '🏠',
          text: `New housing inquiry for your ${myRoommates[0].location} listing`,
          time: myRoommates[0].updated_date || myRoommates[0].created_date
        });
      }
      
      // Recent job matches
      if (matchingRequests.length > 0) {
        activities.push({
          icon: '🎯',
          text: `${matchingRequests.length} students in ${userIndustry} need help this week`,
          time: matchingRequests[0].created_date
        });
      }

      setRecentActivity(activities);

    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleUpdatePost = async (postId, updates) => {
    try {
      await Opportunity.update(postId, updates);
      await loadData(); // Reload all data
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await Opportunity.delete(postId);
      await loadData(); // Reload all data
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
    
    // Check for new activity from session storage
    const checkForNewActivity = () => {
      const newOppJson = sessionStorage.getItem('cff_new_opportunity_activity');
      if (newOppJson) {
        try {
          const newOpp = JSON.parse(newOppJson);
          const timeSincePost = Date.now() - newOpp.timestamp;
          
          // If posted within last 10 seconds, reload
          if (timeSincePost < 10000) {
            console.log('🆕 New opportunity detected, reloading...');
            loadData();
            sessionStorage.removeItem('cff_new_opportunity_activity');
          }
        } catch (e) {
          console.error('Error parsing new opportunity activity:', e);
        }
      }
    };
    
    checkForNewActivity();
    const interval = setInterval(checkForNewActivity, 2000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  // Calculate stats
  const activePosts = myPosts.filter(p => p.status === 'active').length;
  const pendingApps = applications.filter(a => a.status === 'applied' || a.status === 'in_review').length;
  const totalSaved = savedItems.length;
  const newHelpRequests = recommendations.length;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        {/* Primary Focus Card */}
        <div className="mb-8">
          <div 
            className="rounded-xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Ready to make an impact?
            </h3>
            <p className="text-base text-slate-600 mb-6">
              {newHelpRequests > 0 
                ? `${newHelpRequests} students in ${user?.industry || 'your field'} need guidance this week`
                : 'Help students succeed by sharing your expertise and opportunities'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate('Connections')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base rounded-lg shadow-sm"
              >
                Help Students
              </Button>
              <Button
                onClick={() => navigate('Opportunities')}
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-semibold px-6 py-3 text-base rounded-lg"
              >
                Browse Opportunities
              </Button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="flex flex-col md:flex-row gap-8 py-6 border-t border-b border-slate-100 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm text-slate-600 font-medium mb-1">Active Posts</div>
            <div className="text-xl font-bold text-slate-900 mb-2">{activePosts}</div>
            <button 
              onClick={() => setShowMyPostsModal(true)}
              className="text-[13px] text-blue-600 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm text-slate-600 font-medium mb-1">Applications</div>
            <div className="text-xl font-bold text-slate-900 mb-2">
              {pendingApps > 0 ? `${pendingApps} pending` : applications.length}
            </div>
            <button 
              onClick={() => navigate('MyApplications')}
              className="text-[13px] text-blue-600 font-medium hover:underline"
            >
              View
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm text-slate-600 font-medium mb-1">Saved Items</div>
            <div className="text-xl font-bold text-slate-900 mb-2">{totalSaved}</div>
            <button 
              onClick={() => navigate('Favorites')}
              className="text-[13px] text-blue-600 font-medium hover:underline"
            >
              View
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-5">Recent Activity</h4>
          {recentActivity.length > 0 ? (
            <>
              <div className="space-y-4 mb-5">
                {recentActivity.map((activity, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="text-base flex-shrink-0">{activity.icon}</span>
                    <span className="flex-1 text-sm text-slate-700 leading-relaxed">
                      {activity.text}
                    </span>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('MyImpact')}
                className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline"
              >
                View all activity
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No recent activity yet. Start by helping students or posting opportunities!</p>
            </div>
          )}
        </div>
      </div>

      {/* My Posts Modal */}
      <MyPostsModal
        isOpen={showMyPostsModal}
        onClose={() => setShowMyPostsModal(false)}
        posts={myPosts}
        onUpdate={handleUpdatePost}
        onDelete={handleDeletePost}
        applicationsData={applications}
      />
    </>
  );
}
