import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Database,
  RefreshCw,
  MessageCircle,
  Briefcase,
  UserPlus,
  Eye,
  Clock,
  AlertTriangle,
  Loader2,
  Share2,
  CheckCircle,
  Download
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';
import { approveInviteRequest } from '@/functions/approveInviteRequest';
import CommunityInviteManager from '@/components/admin/CommunityInviteManager'; // Added CommunityInviteManager import
import FoundingCircleApplicationsManager from '@/components/admin/FoundingCircleApplicationsManager';
import { backfillStudentRequests } from '@/functions/backfillStudentRequests';
import { cleanupDraftNames } from '@/functions/cleanupDraftNames';
import { exportUsers } from '@/functions/exportUsers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const [directoryDebug, setDirectoryDebug] = useState(null);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [inviteRequests, setInviteRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [foundingCircleCount, setFoundingCircleCount] = useState(0);

  // Access control is handled by Layout.js
  // No need to redirect here

  const loadAnalytics = async (isManualRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      // Force cache bypass with timestamp
      const response = await base44.functions.invoke('getAdminAnalytics', {
        _cacheBust: Date.now()
      }, {
        signal: controller.signal
      }).catch((err) => {
        if (err.message?.includes('Network Error') || err.name === 'AbortError') {
          throw new Error('SILENT_NETWORK_ERROR');
        }
        throw err;
      });

      clearTimeout(timeoutId);
      const data = response?.data;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      setAnalytics(data);
      setLastUpdated(new Date());
      
      if (isManualRefresh) {
        toast({
          title: "Analytics Updated",
          description: "Dashboard data has been refreshed successfully.",
        });
      }
      trackEvent('admin_dashboard_loaded');
    } catch (error) {
      // Silently handle network errors
      if (error.message === 'SILENT_NETWORK_ERROR') {
        setError('Analytics temporarily unavailable');
        // Do not show toast for silent network errors unless it was a manual refresh
        // The default error message below will only apply if analytics is null (initial load failure)
        // If analytics exist, we don't want to show an error message.
        setLoading(false);
        return;
      }

      console.error('Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics');
      
      if (isManualRefresh) {
        toast({
          title: "Error Loading Analytics",
          description: "Unable to refresh analytics. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.roles?.includes('admin')) {
      loadAnalytics(false); // Auto-load once on mount, not a manual refresh
      // Auto-refresh every 15 minutes
      const interval = setInterval(() => loadAnalytics(false), 15 * 60 * 1000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  const testDirectoryFunction = async () => {
    setLoadingDirectory(true);
    try {
      const response = await base44.functions.invoke('getDirectoryUsers', {});
      console.log('Directory function response:', response.data);
      setDirectoryDebug(response.data);
      
      toast({
        title: "Directory Function Test Complete",
        description: `Found ${response.data?.count || 0} users. Check console for details.`,
      });
    } catch (error) {
      console.error('Directory function error:', error);
      toast({
        title: "Directory Function Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingDirectory(false);
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to search",
        variant: "destructive"
      });
      return;
    }

    setLoadingSearch(true);
    setSearchResult(null);

    try {
      const response = await base44.functions.invoke('searchUserForDirectory', {
        email: searchEmail.trim()
      });
      
      setSearchResult(response.data);

    } catch (error) {
      console.error('Failed to search user:', error);
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingSearch(false);
    }
  };

  // Load invite requests
  const loadInviteRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await base44.entities.InviteRequest.filter(
        { status: 'pending' },
        '-created_date',
        50
      );
      setInviteRequests(requests || []);
    } catch (error) {
      console.error('Failed to load invite requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (user?.roles?.includes('admin')) {
      loadInviteRequests();
      loadFoundingCircleCount();
    }
  }, [user]);

  const loadFoundingCircleCount = async () => {
    try {
      const pending = await base44.entities.FoundingCircleApplication.filter({ status: 'pending' });
      setFoundingCircleCount(pending?.length || 0);
    } catch (error) {
      console.error('Failed to load founding circle count:', error);
    }
  };

  const handleInviteAction = async (requestId, action) => {
    setProcessingRequest(requestId);
    try {
      const result = await approveInviteRequest({
        request_id: requestId,
        action: action
      });

      if (result.data.success) {
        toast({
          title: action === 'approve' ? "✅ Approved!" : "Request Rejected",
          description: action === 'approve' 
            ? `Invite code sent: ${result.data.code}` 
            : "Request has been rejected",
        });
        
        // Reload requests
        loadInviteRequests();
      } else {
        throw new Error(result.data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to process invite request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  if (!user || !user.roles?.includes('admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">This dashboard is only available to administrators.</p>
            <Button onClick={() => navigate('Dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
          <p className="text-xs text-slate-500 mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {error === 'Analytics temporarily unavailable' ? 'Analytics Temporarily Unavailable' : 'Error Loading Analytics'}
            </h2>
            <p className="text-slate-600 mb-4">
              {error === 'Analytics temporarily unavailable' 
                ? 'We are unable to fetch the latest analytics data at this time. Please try again later.'
                : 'Analytics are taking longer than usual to load, or an error occurred. This might be due to a slow network connection.'}
            </p>
            <Button onClick={() => {
              setError(null);
              loadAnalytics(true); // Attempt a manual refresh
            }} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Monitor user growth, feature usage, and app performance
            </p>
            {lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            {error && analytics && ( // Display error message if we have cached analytics but latest fetch failed
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {error === 'Analytics temporarily unavailable' ? 'Latest data unavailable. Using cached values.' : `Error: ${error}`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('AuthTest')} 
              variant="outline"
              className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 border-purple-300"
            >
              🧪 Auth Test
            </Button>
            <Button 
              onClick={testDirectoryFunction} 
              disabled={loadingDirectory}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Users className={`w-4 h-4 mr-2 ${loadingDirectory ? 'animate-spin' : ''}`} />
              Test Directory
            </Button>
            <Button 
              onClick={() => loadAnalytics(true)} 
              disabled={loading} 
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* User Search Tool */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Search User by Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="user@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button 
                onClick={searchUser} 
                disabled={loadingSearch}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {searchResult && (
              <div className={`p-4 rounded-lg border ${
                searchResult.found && searchResult.eligible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {!searchResult.found ? (
                  <p className="text-red-800">{searchResult.message}</p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {searchResult.user.full_name || searchResult.user.email}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <span className="ml-2 font-mono">{searchResult.user.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Persona:</span>
                          <span className="ml-2">{searchResult.user.persona || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Roles:</span>
                          <span className="ml-2">{searchResult.user.roles?.join(', ') || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Directory Opt-in:</span>
                          <span className="ml-2">{searchResult.user.includeInDirectory ? '✅ Yes' : '❌ No'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <p className="font-semibold text-sm mb-2">Directory Eligibility Checks:</p>
                      <ul className="space-y-1 text-sm">
                        {searchResult.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {(searchResult.user.major || searchResult.user.current_company || 
                       searchResult.user.current_position || searchResult.user.industry || 
                       searchResult.user.bio || (searchResult.user.graduation_year && searchResult.user.graduation_year > 1900)
                      ) ? (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="font-semibold text-sm mb-2">Profile Content:</p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {searchResult.user.major && <li>• Major: {searchResult.user.major}</li>}
                          {searchResult.user.current_company && <li>• Company: {searchResult.user.current_company}</li>}
                          {searchResult.user.current_position && <li>• Position: {searchResult.user.current_position}</li>}
                          {searchResult.user.industry && <li>• Industry: {searchResult.user.industry}</li>}
                          {searchResult.user.bio && <li>• Bio: {searchResult.user.bio.substring(0, 100)}{searchResult.user.bio.length > 100 ? '...' : ''}</li>}
                          {searchResult.user.graduation_year && searchResult.user.graduation_year > 1900 && <li>• Graduation Year: {searchResult.user.graduation_year}</li>}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Directory Debug Info */}
        {directoryDebug && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Directory Debug Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Total Opted In</p>
                  <p className="text-2xl font-bold text-slate-900">{directoryDebug.debug?.total_opted_in || 0}</p>
                </div>
                <div>
                  <p className="text-slate-600">Filtered Out</p>
                  <p className="text-2xl font-bold text-orange-600">{directoryDebug.debug?.filtered_out || 0}</p>
                </div>
                <div>
                  <p className="text-slate-600">Showing in Directory</p>
                  <p className="text-2xl font-bold text-green-600">{directoryDebug.debug?.returned || 0}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Check the function logs (Code → Functions → getDirectoryUsers → Logs) for detailed filtering reasons
              </p>
            </CardContent>
          </Card>
        )}

        {analytics && (
          <Tabs defaultValue="growth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-8 gap-2 h-auto p-2 bg-white border border-slate-200">
            <TabsTrigger 
              value="growth" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              User Growth
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Feature Usage
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Database
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Sign-up Issues
            </TabsTrigger>
            <TabsTrigger 
              value="invites" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Invite Requests
              {inviteRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {inviteRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Community Invites
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Manual Invite
            </TabsTrigger>
            <TabsTrigger 
              value="backfill" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Database className="w-4 h-4 mr-1" />
              Backfill Requests
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Users
            </TabsTrigger>
            <TabsTrigger 
              value="founding-circle" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white relative"
            >
              🔥 Founding Circle
              {foundingCircleCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
                  {foundingCircleCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

            {/* User Growth Tab */}
            <TabsContent value="growth" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Users"
                  value={analytics.userGrowth?.total || 0}
                  change={analytics.userGrowth?.growth || 0}
                  icon={Users}
                  color="blue"
                />
                <MetricCard
                  title="New This Week"
                  value={analytics.userGrowth?.thisWeek || 0}
                  change={analytics.userGrowth?.weeklyGrowth || 0}
                  icon={UserPlus}
                  color="green"
                  isPercentage={true}
                />
                <MetricCard
                  title="Gators (Students)"
                  value={(analytics.userGrowth?.byType?.gator || 0) + (analytics.userGrowth?.byType?.student || 0)}
                  percentage={analytics.userGrowth?.total > 0 ? 
                    Math.round(((analytics.userGrowth?.byType?.gator || 0) + (analytics.userGrowth?.byType?.student || 0)) / analytics.userGrowth.total * 100) : 0}
                  icon={Users}
                  color="purple"
                />
                <MetricCard
                  title="Parents + Alumni"
                  value={(analytics.userGrowth?.byType?.parent || 0) + (analytics.userGrowth?.byType?.alumni || 0)}
                  percentage={analytics.userGrowth?.total > 0 ? 
                    Math.round(((analytics.userGrowth?.byType?.parent || 0) + (analytics.userGrowth?.byType?.alumni || 0)) / analytics.userGrowth.total * 100) : 0}
                  icon={Users}
                  color="orange"
                />
              </div>

              {(analytics.userGrowth?.byType?.unknown || 0) > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900">
                          {analytics.userGrowth?.byType?.unknown} users with no persona
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          These users likely registered but haven't completed onboarding yet. Use the search tool above to investigate individual accounts.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <GrowthChart data={analytics.userGrowth?.dailySignups || []} />
              <UserBreakdownChart data={analytics.userGrowth?.byType || {}} />
            </TabsContent>

            {/* Feature Usage Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Job Requests"
                  value={analytics.featureUsage?.jobRequests?.total || 0}
                  change={analytics.featureUsage?.jobRequests?.thisWeek || 0}
                  icon={Briefcase}
                  color="blue"
                />
                <MetricCard
                  title="Messages Sent"
                  value={analytics.featureUsage?.messages?.total || 0}
                  change={analytics.featureUsage?.messages?.thisWeek || 0}
                  icon={MessageCircle}
                  color="green"
                />
                <MetricCard
                  title="Profile Views"
                  value={analytics.featureUsage?.profileViews?.total || 0}
                  change={analytics.featureUsage?.profileViews?.thisWeek || 0}
                  icon={Eye}
                  color="purple"
                />
                <MetricCard
                  title="Active Today"
                  value={analytics.featureUsage?.activeToday || 0}
                  percentage={analytics.userGrowth?.total > 0 ? 
                    Math.round((analytics.featureUsage?.activeToday || 0) / analytics.userGrowth.total * 100) : 0}
                  icon={Activity}
                  color="orange"
                />
              </div>

              <FeatureUsageTable data={analytics.featureUsage?.topFeatures || []} />
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Avg Load Time"
                  value={`${analytics.performance?.avgLoadTime || 0}ms`}
                  status={analytics.performance?.avgLoadTime < 2000 ? 'good' : 'warning'}
                  icon={Clock}
                  color="blue"
                />
                <MetricCard
                  title="Error Rate"
                  value={`${analytics.performance?.errorRate || 0}%`}
                  status={analytics.performance?.errorRate < 1 ? 'good' : 'warning'}
                  icon={AlertTriangle}
                  color="red"
                />
                <MetricCard
                  title="API Response"
                  value={`${analytics.performance?.avgApiTime || 0}ms`}
                  status={analytics.performance?.avgApiTime < 500 ? 'good' : 'warning'}
                  icon={Database}
                  color="green"
                />
                <MetricCard
                  title="Uptime"
                  value={`${analytics.performance?.uptime || 99.9}%`}
                  status={analytics.performance?.uptime > 99.5 ? 'good' : 'warning'}
                  icon={TrendingUp}
                  color="purple"
                />
              </div>

              <PerformanceChart data={analytics.performance?.timeline || []} />
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Records"
                  value={analytics.database?.totalRecords || 0}
                  change={analytics.database?.recordsThisWeek || 0}
                  icon={Database}
                  color="blue"
                />
                <MetricCard
                  title="Query Time"
                  value={`${analytics.database?.avgQueryTime || 0}ms`}
                  status={analytics.database?.avgQueryTime < 100 ? 'good' : 'warning'}
                  icon={Clock}
                  color="green"
                />
                <MetricCard
                  title="Storage Used"
                  value={`${analytics.database?.storageUsed || 0}MB`}
                  percentage={analytics.database?.storageLimit > 0 ? 
                    Math.round((analytics.database?.storageUsed || 0) / analytics.database.storageLimit * 100) : 0}
                  icon={Database}
                  color="purple"
                />
                <MetricCard
                  title="Slow Queries"
                  value={analytics.database?.slowQueries || 0}
                  status={analytics.database?.slowQueries < 5 ? 'good' : 'warning'}
                  icon={AlertTriangle}
                  color="orange"
                />
              </div>

              <DatabaseBreakdownTable data={analytics.database?.entityBreakdown || []} />
            </TabsContent>

            {/* Sign-up Issues Tab */}
            <TabsContent value="signup" className="space-y-6">
              <SignUpDiagnostics />
            </TabsContent>

            {/* New Invite Requests Tab */}
            <TabsContent value="invites" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Pending Invite Requests</CardTitle>
                  <Button 
                    onClick={loadInviteRequests} 
                    disabled={loadingRequests}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-600">Loading requests...</p>
                    </div>
                  ) : inviteRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No pending requests</p>
                      <p className="text-sm text-slate-500 mt-1">All invite requests have been processed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inviteRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {request.full_name?.charAt(0) || request.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900">{request.full_name || 'Anonymous'}</h3>
                                  <p className="text-sm text-slate-600">{request.email}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Requested {new Date(request.created_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {request.reason && (
                                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-slate-700 italic">"{request.reason}"</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 md:flex-col md:w-32">
                              <Button
                                onClick={() => handleInviteAction(request.id, 'approve')}
                                disabled={processingRequest === request.id}
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  '✅ Approve'
                                )}
                              </Button>
                              <Button
                                onClick={() => handleInviteAction(request.id, 'reject')}
                                disabled={processingRequest === request.id}
                                variant="outline"
                                className="flex-1 md:flex-none border-red-300 text-red-600 hover:bg-red-50"
                              >
                                ❌ Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <InviteRequestHistory />
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Community Invites Tab */}
            <TabsContent value="community" className="space-y-6">
              <CommunityInviteManager />
            </TabsContent>

            {/* Manual User Creation Tab */}
            <TabsContent value="manual" className="space-y-6">
              <ManualUserCreation />
            </TabsContent>

            {/* Backfill Student Requests Tab */}
            <TabsContent value="backfill" className="space-y-6">
              <BackfillStudentRequests />
            </TabsContent>

            {/* Export Users Tab */}
            <TabsContent value="export" className="space-y-6">
              <ExportUsersSection />
            </TabsContent>

            {/* Founding Circle Applications Tab */}
            <TabsContent value="founding-circle" className="space-y-6">
              <FoundingCircleApplicationsManager />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Sign-up Diagnostics Component
const SignUpDiagnostics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingAttempts, setPendingAttempts] = useState([]);
  const [expiredAttempts, setExpiredAttempts] = useState([]);
  const [usersWithoutPersona, setUsersWithoutPersona] = useState([]);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      // Load pending registration attempts (not verified yet)
      const pending = await base44.entities.RegistrationAttempt.filter(
        { status: 'pending' },
        '-created_date',
        50
      );

      // Load expired registration attempts (older than 24h, still pending)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const expired = (pending || []).filter(att => 
        new Date(att.created_date) < new Date(twentyFourHoursAgo)
      );

      // Load users without persona
      const allUsers = await base44.entities.User.filter({}, '-created_date', 100);
      const noPersona = (allUsers || []).filter(u => !u.persona && !u.roles?.includes('admin'));

      setPendingAttempts(pending || []);
      setExpiredAttempts(expired || []);
      setUsersWithoutPersona(noPersona || []);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
      toast({
        title: "Error",
        description: "Failed to load sign-up diagnostics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-slate-600">Loading diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={pendingAttempts.length > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingAttempts.length}</p>
                <p className="text-sm text-slate-600">Pending Email Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={expiredAttempts.length > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{expiredAttempts.length}</p>
                <p className="text-sm text-slate-600">Expired (24h+)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={usersWithoutPersona.length > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{usersWithoutPersona.length}</p>
                <p className="text-sm text-slate-600">Users Without Persona</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verification Attempts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Email Verifications</CardTitle>
          <Button onClick={loadDiagnostics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {pendingAttempts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>All recent sign-ups have verified their email</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAttempts.map((attempt) => {
                const hoursAgo = Math.floor((Date.now() - new Date(attempt.created_date)) / (1000 * 60 * 60));
                const isExpired = hoursAgo >= 24;
                
                return (
                  <div 
                    key={attempt.id}
                    className={`p-4 rounded-lg border ${isExpired ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">{attempt.full_name}</p>
                          {isExpired && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{attempt.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Signed up {hoursAgo}h ago • Persona: {attempt.persona || 'N/A'}
                        </p>
                      </div>
                      {isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            toast({
                              title: "Resend Feature Coming Soon",
                              description: "Auto-resend verification emails will be added soon",
                            });
                          }}
                        >
                          Resend Email
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Without Persona */}
      {usersWithoutPersona.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Users Without Persona (Onboarding Incomplete)
            </CardTitle>
            <p className="text-sm text-slate-600">
              These users created accounts but didn't complete onboarding
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersWithoutPersona.map((user) => (
                <div key={user.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(user.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Issues & Solutions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Common Sign-up Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-2">🔴 Pending Verifications (24h+)</h4>
            <p className="text-sm text-slate-700">
              Users signed up but never verified their email. Possible causes:
            </p>
            <ul className="text-sm text-slate-600 ml-4 mt-1 space-y-1">
              <li>• Email went to spam folder</li>
              <li>• User entered wrong email</li>
              <li>• Email delivery failed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-2">🟠 No Persona Set</h4>
            <p className="text-sm text-slate-700">
              Users verified email but didn't complete onboarding. Check:
            </p>
            <ul className="text-sm text-slate-600 ml-4 mt-1 space-y-1">
              <li>• Onboarding flow might be broken</li>
              <li>• User closed browser mid-onboarding</li>
              <li>• Error during role selection</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-slate-600">
              💡 <strong>Tip:</strong> Check the Console logs in Code → Functions → registerUser to see detailed error messages for failed sign-ups.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Manual User Creation Component
const ManualUserCreation = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [persona, setPersona] = useState('gator');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    
    if (!email || !fullName || !persona) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Determine invite_type based on selected persona
      const invite_type = persona === 'gator' ? 'admin_to_gator' : 'admin_to_parent';
      
      const response = await base44.functions.invoke('generateInviteCode', {
        invite_type: invite_type
      });

      if (response.data?.code) {
        setInviteCode(response.data.code);
        
        toast({
          title: "✅ Invite Code Generated!",
          description: `Send this code to ${fullName}`,
          duration: 10000,
        });
        
        // Show code in alert for easy copying
        alert(`Invite Code Generated!\n\nCode: ${response.data.code}\n\nSend this code to ${email}. They should:\n1. Go to your app's landing page\n2. Click "Request Invite" or "Enter Invite Code"\n3. Enter this code to get access\n4. They'll then login with Google/Facebook`);
      } else {
        throw new Error(response.data?.error || 'Failed to generate invite');
      }
    } catch (error) {
      console.error('Failed to generate invite:', error);
      toast({
        title: "Error",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generate Invite Code</CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Create a single-use invite code for a user who's having trouble signing up.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateInvite} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              User Type *
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="gator">Student (Gator)</option>
              <option value="parent">Parent</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          {inviteCode && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">Invite Code Generated:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-200 text-lg font-mono text-green-900">
                  {inviteCode}
                </code>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    toast({ title: "Copied!", description: "Invite code copied to clipboard" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>📋 Instructions for the user:</strong>
            </p>
            <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
              <li>Go to the app's landing page</li>
              <li>Click "Request Invite" or enter the invite code</li>
              <li>Enter the code you provide them</li>
              <li>Complete registration by logging in with Google or Facebook</li>
            </ol>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Generate Invite Code
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Component to show recent approved/rejected requests
const InviteRequestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const requests = await base44.entities.InviteRequest.filter(
          { status: { $in: ['approved', 'rejected'] } },
          '-updated_date',
          20
        );
        setHistory(requests || []);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return <div className="text-center text-slate-500 py-4">Loading history...</div>;
  }

  if (history.length === 0) {
    return <div className="text-center text-slate-500 py-4">No recent actions</div>;
  }

  return (
    <div className="space-y-2">
      {history.map((request) => (
        <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{request.email}</p>
            <p className="text-xs text-slate-500">
              {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'} by {request.approved_by || 'Admin'} 
              {' · '}{new Date(request.updated_date).toLocaleDateString()}
            </p>
          </div>
          {request.invite_code_generated && (
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
              {request.invite_code_generated}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, change, percentage, status, icon: Icon, color, isPercentage = false }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          {status && (
            <div className={`w-3 h-3 rounded-full ${
              status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}{isPercentage ? '%' : ''} this week
            </p>
          )}
          {percentage !== undefined && (
            <p className="text-sm text-slate-500 mt-1">{percentage}% of total</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Growth Chart Component
const GrowthChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Daily Sign-ups (Last 30 Days)</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-end justify-between space-x-1">
        {data.slice(-30).map((day, index) => {
          const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
          const height = maxCount > 0 ? Math.max((day.count / maxCount) * 200, 4) : 4;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-200 rounded-t hover:bg-blue-300 transition-colors cursor-pointer"
                style={{ height: `${height}px` }}
                title={`${day.date}: ${day.count} signups`}
              />
              <span className="text-xs text-slate-500 mt-1">
                {new Date(day.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// User Breakdown Chart
const UserBreakdownChart = ({ data }) => {
  // Combine student and gator counts since they're the same
  const combinedData = { ...data };
  if (combinedData.student && combinedData.gator) {
    combinedData.gator = (combinedData.gator || 0) + (combinedData.student || 0);
    delete combinedData.student;
  } else if (combinedData.student && !combinedData.gator) {
    combinedData.gator = combinedData.student;
    delete combinedData.student;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(combinedData).map(([type, count]) => {
            const total = Object.values(combinedData).reduce((sum, c) => sum + c, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <span className="text-sm text-slate-600">{count} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full bg-blue-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Usage Table
const FeatureUsageTable = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Most Popular Features</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {data.map((feature, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b">
            <div>
              <span className="font-medium">{feature.name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">{feature.usage}</span>
              <span className="text-sm text-slate-500 ml-2">uses</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Performance Chart
const PerformanceChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Performance Over Time</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-48 flex items-end space-x-2">
        {data.slice(-24).map((point, index) => {
          const maxTime = data.length > 0 ? Math.max(...data.map(d => d.responseTime)) : 0;
          const height = maxTime > 0 ? Math.max((point.responseTime / maxTime) * 150, 2) : 2;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-200 rounded-t"
                style={{ height: `${height}px` }}
                title={`${point.hour}:00 - ${point.responseTime}ms`}
              />
              <span className="text-xs text-slate-500 mt-1">{point.hour}</span>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// Database Breakdown Table
const DatabaseBreakdownTable = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Database Entity Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {data.map((entity, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b">
            <div>
              <span className="font-medium">{entity.name}</span>
              <span className="text-sm text-slate-500 ml-2">({entity.avgQueryTime}ms avg)</span>
            </div>
            <span className="font-bold">{entity.count} records</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Backfill Student Requests Component
const BackfillStudentRequests = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);

  const runBatch = async (offset = 0, accumulated = { created: [], errors: [] }) => {
    const response = await backfillStudentRequests({ offset, batchSize: 10 });
    
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Backfill failed');
    }

    const newAccumulated = {
      created: [...accumulated.created, ...response.data.created],
      errors: [...accumulated.errors, ...response.data.errors]
    };

    setProgress({
      processed: offset + response.data.summary.processedInBatch,
      total: response.data.summary.studentsWithoutRequests,
      created: newAccumulated.created.length,
      errors: newAccumulated.errors.length
    });

    if (response.data.pagination.hasMore) {
      // Continue with next batch
      return runBatch(response.data.pagination.nextOffset, newAccumulated);
    }

    // All done
    return {
      ...response.data,
      created: newAccumulated.created,
      errors: newAccumulated.errors,
      summary: {
        ...response.data.summary,
        created: newAccumulated.created.length,
        errors: newAccumulated.errors.length
      }
    };
  };

  const handleBackfill = async () => {
    if (!confirm('This will create draft JobRequest entries for all students who don\'t have one. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress(null);

    try {
      const finalResult = await runBatch(0);
      setResult(finalResult);
      toast({
        title: "✅ Backfill Complete!",
        description: `Created ${finalResult.summary.created} draft requests`,
      });
    } catch (error) {
      console.error('Backfill error:', error);
      toast({
        title: "Error",
        description: error.message || "Backfill failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Backfill Student Requests
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Create draft JobRequest entries for students who are in the directory but don't have a help request yet.
          Students will see a banner on their dashboard prompting them to activate their request.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2">⚠️ What this does:</h4>
          <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
            <li>Finds all students/gators without a JobRequest</li>
            <li>Creates a <strong>draft</strong> JobRequest using their profile info (bio, major, etc.)</li>
            <li>Students will see a notification on their dashboard to activate it</li>
            <li>Draft requests are NOT visible on the Emerging Gators page until activated</li>
          </ul>
        </div>

        <Button
          onClick={handleBackfill}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Backfill...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Run Backfill Now
            </>
          )}
        </Button>

        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-blue-900">Processing...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-blue-700">
              {progress.processed} / {progress.total} students processed • {progress.created} created • {progress.errors} errors
            </p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-green-900">✅ Backfill Results</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-slate-900">{result.summary.totalStudents}</p>
                <p className="text-xs text-slate-600">Total Students</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-slate-900">{result.summary.existingRequests}</p>
                <p className="text-xs text-slate-600">Already Had Request</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-green-600">{result.summary.created}</p>
                <p className="text-xs text-slate-600">Drafts Created</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-red-600">{result.summary.errors}</p>
                <p className="text-xs text-slate-600">Errors</p>
              </div>
            </div>

            {result.created.length > 0 && (
              <div>
                <h5 className="font-medium text-sm text-slate-700 mb-2">Created Drafts:</h5>
                <div className="max-h-48 overflow-y-auto bg-white rounded border p-2 space-y-1">
                  {result.created.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 py-1 border-b last:border-0">
                      ✅ {item.name} ({item.email})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div>
                <h5 className="font-medium text-sm text-red-700 mb-2">Errors:</h5>
                <div className="max-h-32 overflow-y-auto bg-red-50 rounded border border-red-200 p-2 space-y-1">
                  {result.errors.map((item, idx) => (
                    <div key={idx} className="text-xs text-red-600 py-1 border-b last:border-0">
                      ❌ {item.email}: {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cleanup Section */}
        <CleanupDraftNames />
      </CardContent>
    </Card>
  );
};

// Export Users Section Component
const ExportUsersSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('all');

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportUsers({ persona: selectedPersona });
      
      // Create download from response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${selectedPersona}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "✅ Export Complete",
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="w-5 h-5 text-green-600" />
          Export User Data
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Download a CSV file containing user names and email addresses.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Select User Type
          </label>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Parents & Alumni (Both)</option>
            <option value="parent">Parents Only</option>
            <option value="alumni">Alumni Only</option>
            <option value="gator">Students/Gators Only</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📋 Exported fields:</strong> Full Name, Email, Persona, Created Date
          </p>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Cleanup Draft Names Component
const CleanupDraftNames = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCleanup = async () => {
    if (!confirm('This will fix name formatting issues (Last, First → First Last) and trim trailing spaces. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await cleanupDraftNames({});
      
      if (response.data?.success) {
        setResult(response.data);
        toast({
          title: "✅ Cleanup Complete!",
          description: `Fixed ${response.data.summary.fixed} records`,
        });
      } else {
        throw new Error(response.data?.error || 'Cleanup failed');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Error",
        description: error.message || "Cleanup failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="font-semibold text-slate-900 mb-2">🧹 Cleanup Draft Data</h4>
      <p className="text-sm text-slate-600 mb-4">
        Fix name formatting issues (e.g., "Last, First" → "First Last") and trim trailing spaces from fields.
      </p>

      <Button
        onClick={handleCleanup}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running Cleanup...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Cleanup
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 bg-slate-50 border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xl font-bold text-slate-900">{result.summary.totalDrafts}</p>
              <p className="text-xs text-slate-600">Total Drafts</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{result.summary.fixed}</p>
              <p className="text-xs text-slate-600">Fixed</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{result.summary.errors}</p>
              <p className="text-xs text-slate-600">Errors</p>
            </div>
          </div>

          {result.fixed.length > 0 && (
            <div className="max-h-32 overflow-y-auto bg-white rounded border p-2 space-y-1">
              {result.fixed.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-600 py-1 border-b last:border-0">
                  ✅ {item.originalName} → {item.newName}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;