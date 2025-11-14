import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Heart, TrendingUp } from 'lucide-react';
import { JobRequest } from '@/entities/JobRequest';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { useAuth } from '@/components/auth/AuthContext';

export default function CompactKPITiles() {
  const { user } = useAuth();
  const [jobRequestsCount, setJobRequestsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      // Load job requests count
      const userRequests = await JobRequest.filter(
        { created_by: user.email }, 
        '-created_date', 
        100 // Get more than we need to count them
      );
      setJobRequestsCount(Array.isArray(userRequests) ? userRequests.length : 0);

      // Load applications count
      const userApplications = await OpportunityApplication.filter(
        { applicant_id: user.id }, 
        '-created_date', 
        100
      );
      setApplicationsCount(Array.isArray(userApplications) ? userApplications.length : 0);

      // Offers count from user profile
      setOffersCount(user?.offers_received_count || 0);
    } catch (error) {
      console.warn('Could not load KPI data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, user?.id, user?.offers_received_count]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Listen for dashboard refresh events (when returning from posting)
  useEffect(() => {
    const handleDashboardRefresh = () => {
      loadCounts();
    };

    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    return () => window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
  }, [loadCounts]);

  const kpis = [
    {
      label: 'Job Requests',
      count: isLoading ? '...' : jobRequestsCount,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Applications',
      count: isLoading ? '...' : applicationsCount,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Offers Received',
      count: isLoading ? '...' : offersCount,
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Profile Views',
      count: 47,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{kpi.count}</div>
                  <div className="text-sm text-slate-600">{kpi.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}