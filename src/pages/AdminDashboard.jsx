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
  Download,
  Mail
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';
import { approveInviteRequest } from '@/functions/approveInviteRequest';
import CommunityInviteManager from '@/components/admin/CommunityInviteManager'; // Added CommunityInviteManager import
import FoundingCircleApplicationsManager from '@/components/admin/FoundingCircleApplicationsManager';
import ReengagementSettings from '@/components/admin/ReengagementSettings';
import AmbassadorManager from '@/components/admin/AmbassadorManager';
import EmailTestPanel from '@/components/admin/EmailTestPanel';
import { backfillStudentRequests } from '@/functions/backfillStudentRequests';
import { cleanupDraftNames } from '@/functions/cleanupDraftNames';
import { exportUsers } from '@/functions/exportUsers';
import { fixMissingPersonas } from '@/functions/fixMissingPersonas';
import { backfillPosterEmails } from '@/functions/backfillPosterEmails';
import { Trash2, BarChart3, Trophy } from 'lucide-react';

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

      console.log('Approve result:', result.data);

      if (result.data.success) {
        // Check if already processed
        if (result.data.alreadyProcessed) {
          toast({
            title: "ℹ️ Already Approved",
            description: `This request was already approved. Code: ${result.data.code}`,
            duration: 5000,
          });
          // Still reload to refresh the list
          loadInviteRequests();
          return;
        }

        if (result.data.warning || result.data.emailError) {
          // Email failed to send
          toast({
            title: "⚠️ Invite Approved BUT Email Failed",
            description: `Code: ${result.data.code}. Error: ${result.data.emailError}`,
            duration: 10000,
            variant: "destructive"
          });
        } else {
          toast({
            title: action === 'approve' ? "✅ Approved!" : "Request Rejected",
            description: action === 'approve' 
              ? `Invite code sent: ${result.data.code}` 
              : "Request has been rejected",
            duration: 5000,
          });
        }
        
        // Reload requests
        loadInviteRequests();
      } else {
        throw new Error(result.data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to process invite request:', error);
      toast({
        title: "Error Processing Request",
        description: error.message || "Failed to process request",
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const [testingEmail, setTestingEmail] = useState(false);
  const [testingInviteEmail, setTestingInviteEmail] = useState(false);
  
  const sendTestEmail = async () => {
    if (!user?.email) return;
    
    setTestingEmail(true);
    try {
      const result = await base44.functions.invoke('sendTestEmail', {
        recipient: user.email
      });
      
      if (result.data?.success) {
        toast({
          title: "✅ Test Email Sent!",
          description: `Check your inbox at ${user.email}`,
        });
      } else {
        throw new Error(result.data?.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email failed:', error);
      toast({
        title: "Test Email Failed",
        description: error.message || "Could not send test email",
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const testInviteEmail = async () => {
    if (!user?.email) return;
    
    setTestingInviteEmail(true);
    try {
      const result = await base44.functions.invoke('testInviteEmail', {
        test_email: user.email
      });
      
      if (result.data?.success) {
        toast({
          title: "✅ Invite Email Sent!",
          description: `Check ${user.email} for the invite email. Code: ${result.data.code}`,
          duration: 10000,
        });
      } else {
        throw new Error(result.data?.error || 'Failed to send invite email');
      }
    } catch (error) {
      console.error('Invite email test failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Could not send invite email",
        variant: "destructive"
      });
    } finally {
      setTestingInviteEmail(false);
    }
  };

  const [diagnosingEmail, setDiagnosingEmail] = useState(false);
  
  const diagnoseSendGrid = async () => {
    if (!user?.email) return;
    
    setDiagnosingEmail(true);
    try {
      const result = await base44.functions.invoke('diagnoseSendGrid', {
        test_email: user.email
      });
      
      if (result.data?.success) {
        toast({
          title: "✅ SendGrid Working!",
          description: result.data.diagnosis,
          duration: 10000,
        });
      } else {
        toast({
          title: "❌ SendGrid Issue Found",
          description: result.data.diagnosis + ": " + result.data.details,
          variant: "destructive",
          duration: 15000,
        });
      }
    } catch (error) {
      console.error('SendGrid diagnosis failed:', error);
      toast({
        title: "Diagnosis Failed",
        description: error.message || "Could not diagnose SendGrid",
        variant: "destructive",
        duration: 15000,
      });
    } finally {
      setDiagnosingEmail(false);
    }
  };

  // Allow access to Admin Dashboard - admin checks handled per-feature

  // Skip loading/error blocking states - show dashboard immediately

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
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => navigate('GatorAuth')} 
              variant="outline"
              className="w-full sm:w-auto bg-green-50 hover:bg-green-100 border-green-300"
            >
              🔐 Test Login Flow
            </Button>
            <Button 
              onClick={() => navigate('TestingDashboard')} 
              variant="outline"
              className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 border-blue-300"
            >
              🧪 Testing Dashboard
            </Button>
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

        {(analytics || loading) && (
          <Tabs defaultValue="growth" className="space-y-6">
          <TabsList className="flex w-full gap-2 h-auto p-2 bg-white border border-slate-200 overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger 
              value="growth" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              User Growth
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              Feature Usage
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              Database
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Sign-up Issues
            </TabsTrigger>
            <TabsTrigger 
              value="invites" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
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
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Community Invites
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Manual Invite
            </TabsTrigger>
            <TabsTrigger 
              value="backfill" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Database className="w-4 h-4 mr-1" />
              Backfill Requests
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Users
            </TabsTrigger>
            <TabsTrigger 
              value="founding-circle" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white relative whitespace-nowrap flex-shrink-0"
            >
              🔥 Founding Circle
              {foundingCircleCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
                  {foundingCircleCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="referrals" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              🎁 Referrals
            </TabsTrigger>
            <TabsTrigger 
              value="persona-audit" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              🔍 Persona Audit
            </TabsTrigger>
            <TabsTrigger 
              value="opportunities" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Briefcase className="w-4 h-4 mr-1" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger 
              value="engagement" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Engagement
            </TabsTrigger>
            <TabsTrigger 
              value="reengagement" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Mail className="w-4 h-4 mr-1" />
              Re-Engagement
            </TabsTrigger>
            <TabsTrigger 
              value="email-test" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email Test Panel
            </TabsTrigger>
            <TabsTrigger 
              value="ambassadors" 
              className="text-sm sm:text-base px-3 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
            >
              <Users className="w-4 h-4 mr-1" />
              Ambassadors
            </TabsTrigger>
          </TabsList>

            {/* User Growth Tab */}
            <TabsContent value="growth" className="space-y-6">
              {!analytics ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading analytics...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </TabsContent>

            {/* Feature Usage Tab */}
            <TabsContent value="features" className="space-y-6">
              {!analytics ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading analytics...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              {!analytics ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading analytics...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-6">
              {!analytics ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading analytics...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={sendTestEmail}
                      disabled={testingEmail}
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-300"
                    >
                      {testingEmail ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      Test Email
                    </Button>
                    <Button 
                      onClick={testInviteEmail}
                      disabled={testingInviteEmail}
                      variant="outline"
                      size="sm"
                      className="bg-orange-50 hover:bg-orange-100 border-orange-300"
                    >
                      {testingInviteEmail ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Test Invite Email
                    </Button>
                    <Button 
                      onClick={diagnoseSendGrid}
                      disabled={diagnosingEmail}
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 border-red-300"
                    >
                      {diagnosingEmail ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2" />
                      )}
                      Diagnose SendGrid
                    </Button>
                    <Button 
                      onClick={loadInviteRequests} 
                      disabled={loadingRequests}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  request.role === 'alumni' 
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                                    : 'bg-gradient-to-br from-orange-500 to-orange-700'
                                }`}>
                                  {request.full_name?.charAt(0) || request.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-900">{request.full_name || 'Anonymous'}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      request.role === 'alumni'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                      {request.role === 'alumni' ? '🎓 Alumni' : '👨‍👩‍👧 Parent'}
                                    </span>
                                  </div>
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

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-600 mb-4">View detailed referral tracking and analytics</p>
                  <Button onClick={() => navigate('AdminReferrals')} className="bg-orange-500 hover:bg-orange-600">
                    🎁 Open Referral Dashboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Persona Audit Tab */}
            <TabsContent value="persona-audit" className="space-y-6">
              <PersonaAuditSection />
            </TabsContent>

            {/* Opportunities Management Tab */}
            <TabsContent value="opportunities" className="space-y-6">
              <OpportunitiesManagement />
            </TabsContent>

            {/* Engagement Analytics Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <EngagementAnalytics />
            </TabsContent>

            {/* Re-Engagement Settings Tab */}
            <TabsContent value="reengagement" className="space-y-6">
              <ReengagementSettings />
            </TabsContent>

            {/* Ambassadors Tab */}
            <TabsContent value="ambassadors" className="space-y-6">
              <AmbassadorManager />
            </TabsContent>

            {/* Email Test Panel Tab */}
            <TabsContent value="email-test" className="space-y-6">
              <EmailTestPanel />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

const SignUpDiagnostics = React.lazy(() => import('@/components/admin/SignUpDiagnosticsTab'));

// SignUpDiagnostics extracted to components/admin/SignUpDiagnosticsTab.jsx

// Manual User Creation Component
const ManualUserCreation = React.lazy(() => import('@/components/admin/ManualUserCreation'));

// Inline small helper components
const InviteRequestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { base44.entities.InviteRequest.filter({ status: { $in: ['approved', 'rejected'] } }, '-updated_date', 20).then(r => setHistory(r || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-center text-slate-500 py-4">Loading...</div>;
  if (!history.length) return <div className="text-center text-slate-500 py-4">No recent actions</div>;
  return (<div className="space-y-2">{history.map(r => (<div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0"><div className="flex-1"><p className="text-sm font-medium text-slate-900">{r.email}</p><p className="text-xs text-slate-500">{r.status === 'approved' ? '✅' : '❌'} {new Date(r.updated_date).toLocaleDateString()}</p></div>{r.invite_code_generated && <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{r.invite_code_generated}</span>}</div>))}</div>);
};
const MetricCard = ({ title, value, change, percentage, status, icon: Icon, color, isPercentage = false }) => {
  const c = { blue: 'text-blue-600 bg-blue-100', green: 'text-green-600 bg-green-100', purple: 'text-purple-600 bg-purple-100', orange: 'text-orange-600 bg-orange-100', red: 'text-red-600 bg-red-100' };
  return (<Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div className={`p-2 rounded-lg ${c[color]}`}><Icon className="w-4 h-4" /></div>{status && <div className={`w-3 h-3 rounded-full ${status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`} />}</div><div className="mt-4"><p className="text-sm text-slate-600">{title}</p><p className="text-2xl font-bold text-slate-900">{value}</p>{change !== undefined && <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change}{isPercentage ? '%' : ''} this week</p>}{percentage !== undefined && <p className="text-sm text-slate-500 mt-1">{percentage}% of total</p>}</div></CardContent></Card>);
};
const GrowthChart = ({ data }) => (<Card><CardHeader><CardTitle className="text-lg">Daily Sign-ups (Last 30 Days)</CardTitle></CardHeader><CardContent><div className="h-64 flex items-end justify-between space-x-1">{data.slice(-30).map((d, i) => { const mx = Math.max(...data.map(x => x.count), 1); return <div key={i} className="flex-1 flex flex-col items-center"><div className="w-full bg-blue-200 rounded-t hover:bg-blue-300 cursor-pointer" style={{ height: `${Math.max((d.count / mx) * 200, 4)}px` }} title={`${d.date}: ${d.count}`} /><span className="text-xs text-slate-500 mt-1">{new Date(d.date).getDate()}</span></div>; })}</div></CardContent></Card>);
const UserBreakdownChart = ({ data }) => { const d = { ...data }; if (d.student && d.gator) { d.gator += d.student; delete d.student; } else if (d.student) { d.gator = d.student; delete d.student; } const t = Object.values(d).reduce((s, c) => s + c, 0); return (<Card><CardHeader><CardTitle className="text-lg">User Types</CardTitle></CardHeader><CardContent><div className="space-y-4">{Object.entries(d).map(([k, v]) => { const p = t > 0 ? (v / t) * 100 : 0; return <div key={k} className="space-y-2"><div className="flex justify-between"><span className="text-sm font-medium capitalize">{k}</span><span className="text-sm text-slate-600">{v} ({Math.round(p)}%)</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p}%` }} /></div></div>; })}</div></CardContent></Card>); };
const FeatureUsageTable = ({ data }) => (<Card><CardHeader><CardTitle className="text-lg">Most Popular Features</CardTitle></CardHeader><CardContent><div className="space-y-2">{data.map((f, i) => <div key={i} className="flex justify-between items-center py-2 border-b"><span className="font-medium">{f.name}</span><div><span className="font-bold">{f.usage}</span><span className="text-sm text-slate-500 ml-2">uses</span></div></div>)}</div></CardContent></Card>);
const PerformanceChart = ({ data }) => (<Card><CardHeader><CardTitle className="text-lg">Performance Over Time</CardTitle></CardHeader><CardContent><div className="h-48 flex items-end space-x-2">{data.slice(-24).map((p, i) => { const mx = Math.max(...data.map(d => d.responseTime), 1); return <div key={i} className="flex-1 flex flex-col items-center"><div className="w-full bg-green-200 rounded-t" style={{ height: `${Math.max((p.responseTime / mx) * 150, 2)}px` }} title={`${p.hour}:00 - ${p.responseTime}ms`} /><span className="text-xs text-slate-500 mt-1">{p.hour}</span></div>; })}</div></CardContent></Card>);
const DatabaseBreakdownTable = ({ data }) => (<Card><CardHeader><CardTitle className="text-lg">Database Entity Breakdown</CardTitle></CardHeader><CardContent><div className="space-y-2">{data.map((e, i) => <div key={i} className="flex justify-between items-center py-2 border-b"><div><span className="font-medium">{e.name}</span><span className="text-sm text-slate-500 ml-2">({e.avgQueryTime}ms)</span></div><span className="font-bold">{e.count} records</span></div>)}</div></CardContent></Card>);

// Lazy-loaded extracted components
const BackfillStudentRequests = React.lazy(() => import('@/components/admin/BackfillSection'));
const ExportUsersSection = React.lazy(() => import('@/components/admin/ExportUsersSection'));
const FixMissingPersonasSection = React.lazy(() => import('@/components/admin/FixMissingPersonasTab'));
const PersonaAuditSection = React.lazy(() => import('@/components/admin/PersonaAuditTab'));
const OpportunitiesManagement = React.lazy(() => import('@/components/admin/OpportunitiesManagementTab'));
const EngagementAnalytics = React.lazy(() => import('@/components/admin/EngagementAnalyticsTab'));
const TopStudentsSection = React.lazy(() => import('@/components/admin/TopStudentsTab'));

export default AdminDashboard;