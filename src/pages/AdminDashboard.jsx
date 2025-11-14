
import { useState, useEffect } from 'react';
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
  Share2 // Added Share2 import
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';
import { approveInviteRequest } from '@/functions/approveInviteRequest';
import CommunityInviteManager from '@/components/admin/CommunityInviteManager'; // Added CommunityInviteManager import

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

  // Check admin access
  useEffect(() => {
    if (user && !user.roles?.includes('admin')) {
      navigate('Dashboard');
      return;
    }
  }, [user]);

  const loadAnalytics = async (isManualRefresh = false) => {
    // Don't auto-load on mount if we already have data and it's not a manual refresh
    if (!isManualRefresh && analytics) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

      const response = await base44.functions.invoke('getAdminAnalytics', {}, {
        signal: controller.signal
      }).catch((err) => {
        // Suppress network errors and AbortError completely
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
    }
  }, [user]);

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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 gap-2 h-auto p-2 bg-white border border-slate-200">
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
                  title="Students"
                  value={analytics.userGrowth?.byType?.student || 0}
                  percentage={analytics.userGrowth?.total > 0 ? 
                    Math.round((analytics.userGrowth?.byType?.student || 0) / analytics.userGrowth.total * 100) : 0}
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
          </Tabs>
        )}
      </div>
    </div>
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
const UserBreakdownChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">User Types</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Object.entries(data).map(([type, count]) => {
          const total = Object.values(data).reduce((sum, c) => sum + c, 0);
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

export default AdminDashboard;
