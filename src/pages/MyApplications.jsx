import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Clock, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import CompanyLogo from '@/components/opportunities/CompanyLogo';
import { formatDistanceToNow } from 'date-fns';
import { navigate as customNavigate } from '@/components/utils/navigation';

const statusStyles = {
  applied: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-purple-100 text-purple-800',
  interview: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const StatusBadge = ({ status }) => (
  <Badge className={`${statusStyles[status] || statusStyles.closed} border-transparent text-xs`}>
    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </Badge>
);

const ApplicationItem = ({ application }) => {
  // Use snapshot data from the application record
  const title = application.opportunity_title || '(Opportunity no longer available)';
  const company = application.opportunity_company || 'Unknown Company';
  const isDeleted = application.opportunity_deleted;

  // Format the date properly - ensure it's always "ago"
  const getTimeAgo = () => {
    try {
      const createdDate = new Date(application.created_date);
      const now = new Date();
      
      // If date seems to be in the future (shouldn't happen), show "just now"
      if (createdDate > now) {
        return 'just now';
      }
      
      // Calculate time difference in seconds
      const diffInSeconds = Math.floor((now - createdDate) / 1000);
      
      if (diffInSeconds < 10) {
        return 'a few seconds ago';
      } else if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
      } else if (diffInSeconds < 120) {
        return 'a minute ago';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minutes ago`;
      } else if (diffInSeconds < 7200) {
        return 'an hour ago';
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hours ago`;
      } else {
        return formatDistanceToNow(createdDate, { addSuffix: true });
      }
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className={`p-4 border-b border-gray-200 last:border-b-0 ${isDeleted ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}>
      <div className="flex items-center gap-4">
        <CompanyLogo name={company} className="w-12 h-12 flex-shrink-0" />
        <div className="flex-grow">
          <h3 className={`font-semibold ${isDeleted ? 'text-gray-500 italic' : 'text-gray-900'}`}>{title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Building className="w-3 h-3" />
            <span>{company}</span>
            <span className="text-gray-300">|</span>
            <Clock className="w-3 h-3" />
            <span>Applied {getTimeAgo()}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isDeleted ? (
            <Badge className="bg-gray-100 text-gray-600 border-transparent text-xs">
              Archived
            </Badge>
          ) : (
            <StatusBadge status={application.status} />
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch applications using both methods
      const [byId, byEmail] = await Promise.all([
        OpportunityApplication.filter({ applicant_id: user.id }, '-created_date').catch(() => []),
        OpportunityApplication.filter({ created_by: user.email }, '-created_date').catch(() => [])
      ]);
      
      // Merge and deduplicate
      const allApps = [...byId];
      const existingIds = new Set(byId.map(app => app.id));
      
      byEmail.forEach(app => {
        if (!existingIds.has(app.id)) {
          allApps.push(app);
        }
      });
      
      // No need to fetch opportunities - we have snapshot data
      setApplications(allApps);

    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setError(error.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleGoBack = () => {
    // Navigate to the appropriate dashboard based on user persona
    let dashboardPage = 'Dashboard';
    if (user?.persona === 'parent') dashboardPage = 'ParentDashboard';
    else if (user?.persona === 'alumni') dashboardPage = 'AlumniDashboard';
    else if (user?.persona === 'admin') dashboardPage = 'AdminDashboard';
    
    customNavigate(dashboardPage);
  };

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view your applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
              My Applications
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchApplications} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Error Loading Applications</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchApplications}>Try Again</Button>
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-4" />
                <p>Loading your applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {applications.map(app => (
                  <ApplicationItem key={app.id} application={app} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Applications Yet</h3>
                <p className="text-sm mb-4">When you apply for opportunities, they will appear here.</p>
                <Button onClick={() => customNavigate('Opportunities')}>Find Opportunities</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}