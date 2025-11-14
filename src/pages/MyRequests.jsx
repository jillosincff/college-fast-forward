import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { JobRequest } from '@/entities/JobRequest';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowLeft } from 'lucide-react';
import MyListings from '@/components/dashboard/MyListings';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyRequests = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const requests = await JobRequest.filter({ created_by: user.email }, '-created_date');
      setMyRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Failed to load user's requests:", error);
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  const handleGoBack = () => {
    // Navigate to the appropriate dashboard based on user persona
    let dashboardPage = 'Dashboard';
    if (user?.persona === 'parent') dashboardPage = 'ParentDashboard';
    else if (user?.persona === 'alumni') dashboardPage = 'AlumniDashboard';
    else if (user?.persona === 'admin') dashboardPage = 'AdminDashboard';
    
    navigate(dashboardPage);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <MyListings 
          type="requests" 
          requests={myRequests} 
          loading={loading} 
          onUpdate={loadMyRequests}
        />
      </div>
    </div>
  );
}