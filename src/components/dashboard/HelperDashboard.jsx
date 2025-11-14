import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReferralLink } from '@/entities/ReferralLink';
import { ReferralEvent } from '@/entities/ReferralEvent';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from '@/components/router/SimpleRouter';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award,
  ExternalLink,
  Download,
  Plus,
  ArrowRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { updateReferralStatus } from '@/functions/updateReferralStatus';

const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600">{title}</p>
          <p 
            className="text-xl sm:text-2xl font-bold text-slate-900 mt-1" 
            aria-label={`${title}: ${value}`}
          >
            {value}
          </p>
          {change && (
            <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-slate-500'} mt-1`}>
              {change > 0 ? '+' : ''}{change} this month
            </p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ReferralRow = ({ referral, onViewDetails, onReshare }) => {
  const { toast } = useToast();

  const handleReshare = async () => {
    try {
      await onReshare(referral.id);
      navigator.clipboard.writeText(referral.short_url);
      toast({ title: "✅ Link copied!", description: "Referral link copied to clipboard" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isExpired = referral.expires_at && new Date(referral.expires_at) < new Date();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{referral.request_title}</h3>
          <p className="text-sm text-slate-600 mb-2">{referral.student_name}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Created {formatDistanceToNow(new Date(referral.created_date))} ago</span>
            <Badge className={getStatusColor(referral.status)}>
              {isExpired ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Expired
                </span>
              ) : (
                referral.status
              )}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-slate-900">{referral.click_count || 0}</p>
            <p className="text-xs text-slate-500">Clicks</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{referral.interview_count || 0}</p>
            <p className="text-xs text-slate-500">Interviews</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{referral.offer_count || 0}</p>
            <p className="text-xs text-slate-500">Offers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReshare}
            className="flex items-center gap-2"
            aria-label={`Reshare referral link for ${referral.request_title}`}
          >
            <Copy className="w-4 h-4" />
            Reshare
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(referral)}
            className="flex items-center gap-2"
            aria-label={`View details for ${referral.request_title}`}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReferralDetailsPanel = ({ referral, events, isOpen, onClose, onUpdateStatus }) => {
  const [newEventType, setNewEventType] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (!newEventType) return;
    
    setIsUpdating(true);
    try {
      await updateReferralStatus({
        linkId: referral.id,
        eventType: newEventType,
        metadata: {}
      });
      onUpdateStatus();
      setNewEventType('');
      toast({ title: "Status updated!", description: "Referral status has been updated" });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
    setIsUpdating(false);
  };

  const handleReshare = () => {
    navigator.clipboard.writeText(referral.short_url);
    toast({ title: "✅ Link copied!", description: "Referral link copied to clipboard" });
  };

  const eventIcons = {
    created: '🎯',
    clicked: '👆',
    interview: '📅', 
    offer: '🎉'
  };

  const eventLabels = {
    created: 'Link Generated',
    clicked: 'Link Clicked',
    interview: 'Interview Scheduled',
    offer: 'Offer Extended'
  };

  const isExpired = referral.expires_at && new Date(referral.expires_at) < new Date();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left">
            {referral.request_title}
          </SheetTitle>
          <p className="text-sm text-slate-600 text-left">
            {referral.student_name} • Created {format(new Date(referral.created_date), 'MMM d, yyyy')}
          </p>
          {isExpired && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This referral link has expired. Use the "Copy Referral Link" button below to reshare.
              </AlertDescription>
            </Alert>
          )}
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Event Timeline</h3>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No events recorded yet</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">
                      {eventIcons[event.event_type]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{eventLabels[event.event_type]}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(event.occurred_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Update Status */}
          <div>
            <h3 className="font-semibold mb-4">Update Status</h3>
            <div className="flex gap-2">
              <select 
                value={newEventType} 
                onChange={(e) => setNewEventType(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select status update type"
              >
                <option value="">Select update...</option>
                <option value="interview">Interview Scheduled</option>
                <option value="offer">Offer Extended</option>
              </select>
              <Button 
                onClick={handleStatusUpdate}
                disabled={!newEventType || isUpdating}
                size="sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleReshare}
                aria-label="Copy referral link to clipboard"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Referral Link
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(referral.short_url, '_blank')}
                aria-label="View original request in new tab"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original Request
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const CreateReferralModal = ({ isOpen, onClose }) => {
  const { navigate } = useRouter();

  const handleCreateReferral = () => {
    onClose();
    navigate('SixDegrees');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your First Referral</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-slate-600">
            To create referral links, browse student requests on the Connections page and click "Connect" to generate trackable links.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateReferral} className="bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]">
              Browse Requests
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function HelperDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { navigate } = useRouter();
  const [stats, setStats] = useState({ intros: 0, clicks: 0, interviews: 0, offers: 0 });
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralEvents, setReferralEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferrals();
    }
  }, [user]);

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const fetchedReferrals = await ReferralLink.filter(
        { helper_user_id: user.id }, 
        '-created_date'
      );
      
      setReferrals(fetchedReferrals || []);
      
      // Calculate stats
      const safeReferrals = fetchedReferrals || [];
      const totalIntros = safeReferrals.length;
      const totalClicks = safeReferrals.reduce((sum, r) => sum + (r.click_count || 0), 0);
      const totalInterviews = safeReferrals.reduce((sum, r) => sum + (r.interview_count || 0), 0);
      const totalOffers = safeReferrals.reduce((sum, r) => sum + (r.offer_count || 0), 0);
      
      setStats({
        intros: totalIntros,
        clicks: totalClicks, 
        interviews: totalInterviews,
        offers: totalOffers
      });
      
    } catch (error) {
      console.error('Failed to load referrals:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load your referrals. Please try again.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleViewDetails = async (referral) => {
    setSelectedReferral(referral);
    
    try {
      const events = await ReferralEvent.filter(
        { link_id: referral.id }, 
        'occurred_at'
      );
      setReferralEvents(events || []);
    } catch (error) {
      console.error('Failed to load referral events:', error);
      setReferralEvents([]);
      toast({ 
        title: "Warning", 
        description: "Could not load event timeline", 
        variant: "destructive" 
      });
    }
    
    setShowDetails(true);
  };

  const handleUpdateStatus = () => {
    loadReferrals(); // Refresh the list to get updated metrics
  };

  const handleReshare = async (referralId) => {
    // In a production environment, you might check expiration and regenerate
    return referralId;
  };

  const handleExport = () => {
    try {
      const csvData = [
        ['Request Title', 'Student Name', 'Created Date', 'Status', 'Clicks', 'Interviews', 'Offers'],
        ...referrals.map(r => [
          r.request_title || '',
          r.student_name || '',
          format(new Date(r.created_date), 'yyyy-MM-dd'),
          r.status || 'unknown',
          r.click_count || 0,
          r.interview_count || 0,
          r.offer_count || 0
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-referrals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({ title: "✅ Export complete!", description: "CSV file downloaded successfully" });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-20 bg-slate-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              Welcome back, {user?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-base md:text-lg text-blue-100">
              Here's how your referrals are performing
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard 
            icon={Share2} 
            title="Total Intros" 
            value={stats.intros}
            color="blue"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Clicks" 
            value={stats.clicks}
            color="green"
          />
          <StatCard 
            icon={Calendar} 
            title="Interviews" 
            value={stats.interviews}
            color="purple"
          />
          <StatCard 
            icon={Award} 
            title="Offers" 
            value={stats.offers}
            color="orange"
          />
        </div>

        {/* Referrals Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Referrals ({referrals.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} disabled={referrals.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setShowCreateModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Referral
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <Share2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No referrals yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start sharing opportunities to track your impact
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Referral
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <ReferralRow
                    key={referral.id}
                    referral={referral}
                    onViewDetails={handleViewDetails}
                    onReshare={(id) => handleReshare(id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Panel */}
      {selectedReferral && (
        <ReferralDetailsPanel
          referral={selectedReferral}
          events={referralEvents}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Create Referral Modal */}
      <CreateReferralModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}