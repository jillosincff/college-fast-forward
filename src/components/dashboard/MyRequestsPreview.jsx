import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { JobRequest } from '@/entities/JobRequest';
import { useAuth } from '@/components/auth/AuthContext';

const RequestCard = ({ request }) => {
  return (
    <div className="request-card active-card bg-white p-4 rounded-xl border-2 border-green-500/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="request-status flex items-center justify-between mb-2">
        <span className="status-badge active inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
          Getting Attention
        </span>
        <span className="time-stamp text-xs text-slate-500">
          {formatDistanceToNow(new Date(request.created_date))} ago
        </span>
      </div>
      <h4 className="request-title text-base font-bold text-slate-800 mb-3">{request.role}</h4>
      <div className="request-engagement space-y-2 mb-4">
        <div className="engagement-item flex items-center gap-2 text-sm text-slate-600">
          <span className="icon parent-icon">👨‍💼</span>
          <span className="text">2 parents offered connections</span>
        </div>
        <div className="engagement-item flex items-center gap-2 text-sm text-slate-600">
          <span className="icon alumni-icon">🎓</span>
          <span className="text">1 alumni ready to advise</span>
        </div>
        <div className="engagement-item flex items-center gap-2 text-sm text-slate-600">
          <span className="icon message-icon">💬</span>
          <span className="text">3 messages received</span>
        </div>
      </div>
      <Button 
        onClick={() => navigate('MyRequests')}
        className="view-responses-btn w-full bg-slate-800 hover:bg-slate-900 text-white"
      >
        View All Responses
      </Button>
    </div>
  );
};

const EmptyState = () => (
    <div className="text-center py-12 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">No active requests</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        Post a request and let the Gator network know how they can help you!
      </p>
      <Button onClick={() => navigate('PostRequest')} className="bg-orange-500 hover:bg-orange-600">
        <Plus className="w-4 h-4 mr-2" />
        Post a Request
      </Button>
    </div>
);

export default function MyRequestsPreview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const userRequests = await JobRequest.filter(
        { created_by: user.email, status: 'active' }, 
        '-created_date', 
        3 // Limit to 3 for the preview
      );
      setRequests(Array.isArray(userRequests) ? userRequests : []);
    } catch (error) {
      console.warn('Could not load user requests:', error.message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <section className="requests-section mt-8">
      <div className="section-header flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-slate-900">Your Active Requests</h3>
        <div className="engagement-preview flex items-center gap-4 text-sm text-slate-600">
          <span className="engagement-stat">47 profile views</span>
          <span className="engagement-stat font-medium text-green-700">12 people want to help</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : requests.length > 0 ? (
        <div className="request-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => <RequestCard key={req.id} request={req} />)}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}