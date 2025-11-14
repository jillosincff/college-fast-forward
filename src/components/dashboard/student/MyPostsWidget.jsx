import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobRequest } from '@/entities/JobRequest';
import { RoommatePost } from '@/entities/RoommatePost';
import { useAuth } from '@/components/auth/AuthContext';
import { ArrowRight, Briefcase, Home, AlertCircle, Plus } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { differenceInDays, addDays, formatDistanceToNow } from 'date-fns';

export default function MyPostsWidget() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyPosts();
  }, [user]);

  const loadMyPosts = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const [requests, roommates] = await Promise.all([
        JobRequest.filter({ created_by: user.email }, '-created_date', 10),
        RoommatePost.filter({ created_by: user.email }, '-created_date', 10)
      ]);

      const combined = [
        ...requests.map(r => ({ ...r, type: 'request' })),
        ...roommates.map(r => ({ ...r, type: 'roommate' }))
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      setMyPosts(combined);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiration = (createdDate) => {
    const expirationDate = addDays(new Date(createdDate), 30);
    return differenceInDays(expirationDate, new Date());
  };

  const expiringPosts = myPosts.filter(post => {
    const daysLeft = getDaysUntilExpiration(post.created_date);
    return daysLeft <= 7 && daysLeft >= 0;
  });

  const getTitle = (post) => {
    if (post.type === 'request') return post.role || post.title;
    return post.title;
  };

  const getIcon = (post) => {
    return post.type === 'request' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Active Posts</span>
            <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Active Posts</span>
          <Badge variant="outline" className="font-semibold">
            {myPosts.length}
          </Badge>
        </CardTitle>
        {expiringPosts.length > 0 && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            {expiringPosts.length} {expiringPosts.length === 1 ? 'post' : 'posts'} expiring soon
          </div>
        )}
      </CardHeader>
      <CardContent>
        {myPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">No active posts yet</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => navigate('PostRequest')} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Post Request
              </Button>
              <Button size="sm" onClick={() => navigate('Roommates')} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Post Room
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {myPosts.slice(0, 3).map((post) => {
                const daysLeft = getDaysUntilExpiration(post.created_date);
                const isExpiring = daysLeft <= 7;
                
                return (
                  <div
                    key={post.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 ${
                      isExpiring ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'
                    }`}
                    onClick={() => {
                      if (post.type === 'request') {
                        navigate('MyRequests');
                      } else {
                        navigate('Roommates');
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getIcon(post)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {getTitle(post)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Posted {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                          </p>
                          {isExpiring && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">
                              {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={post.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {myPosts.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => navigate('MyRequests')}
              >
                View All ({myPosts.length})
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}