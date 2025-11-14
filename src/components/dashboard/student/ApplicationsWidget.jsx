
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Building, Clock, Plus, AlertCircle } from 'lucide-react';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { Opportunity } from '@/entities/Opportunity';
import { useAuth } from '@/components/auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { navigate } from '@/components/utils/navigation';
import CompanyLogo from '@/components/opportunities/CompanyLogo';

const statusStyles = {
  applied: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-purple-100 text-purple-800',
  interview: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const ApplicationStatusBadge = ({ status }) => (
  <Badge className={`${statusStyles[status] || statusStyles.closed} border-transparent text-xs`}>
    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </Badge>
);

export default function ApplicationsWidget() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentApplications = useCallback(async () => {
    if (!user) {
      console.log('ApplicationsWidget: No user found');
      setIsLoading(false);
      return;
    }
    
    console.log('ApplicationsWidget: Fetching applications for user:', user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      // Get most recent 3 applications
      const userApps = await OpportunityApplication.filter({ applicant_id: user.id }, '-created_date', 3);
      console.log('ApplicationsWidget: Found applications:', userApps.length, userApps);
      
      if (userApps.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      const opportunityIds = [...new Set(userApps.map(app => app.opportunity_id))];
      console.log('ApplicationsWidget: Fetching opportunities for IDs:', opportunityIds);
      
      const opportunityDetails = await Promise.allSettled(
        opportunityIds.map(id => Opportunity.get(id))
      );
      
      const opportunitiesMap = {};
      opportunityDetails.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          opportunitiesMap[opportunityIds[index]] = result.value;
        } else {
          console.warn('ApplicationsWidget: Failed to fetch opportunity', opportunityIds[index], result.reason);
        }
      });
      
      console.log('ApplicationsWidget: Opportunity details loaded:', Object.keys(opportunitiesMap).length);
      
      const combinedData = userApps
        .map(app => ({
          ...app,
          opportunity: opportunitiesMap[app.opportunity_id],
        }))
        .filter(app => {
          if (!app.opportunity) {
            console.warn('ApplicationsWidget: Filtering out application with missing opportunity:', app.id);
            return false;
          }
          return true;
        });

      console.log('ApplicationsWidget: Final applications to display:', combinedData.length);
      setApplications(combinedData);
    } catch (error) {
      console.error("ApplicationsWidget: Failed to fetch applications:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Dependency array for useCallback

  useEffect(() => {
    fetchRecentApplications();

    // Listen for the custom event to refresh data
    const handleApplicationSubmitted = () => fetchRecentApplications();
    document.addEventListener('opp:applied', handleApplicationSubmitted);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener('opp:applied', handleApplicationSubmitted);
    };
  }, [fetchRecentApplications]); // Dependency array for useEffect

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Error loading applications: {error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            My Applications
          </CardTitle>
          {applications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('MyApplications')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.length > 0 ? (
          <>
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CompanyLogo name={app.opportunity.org_name} className="w-10 h-10" />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 truncate max-w-40">
                      {app.opportunity.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building className="w-3 h-3" />
                      <span className="truncate max-w-24">{app.opportunity.org_name}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(app.created_date))} ago</span>
                    </div>
                  </div>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => navigate('MyApplications')}
            >
              <FileText className="w-4 h-4 mr-2" />
              View All Applications ({applications.length})
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No Applications Yet</h4>
            <p className="text-gray-500 text-sm mb-4">
              Start applying to opportunities to track them here.
            </p>
            <Button size="sm" onClick={() => navigate('Opportunities')}>
              <Plus className="w-4 h-4 mr-2" />
              Find Opportunities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
