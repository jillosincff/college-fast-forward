import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Users,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';
import { FoundingCircleApplication } from '@/entities/FoundingCircleApplication';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

export default function FoundingCircleApplicationsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const pending = await FoundingCircleApplication.filter(
        { status: 'pending' },
        '-created_date',
        50
      );
      setApplications(pending || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleAction = async (applicationId, action) => {
    setProcessingId(applicationId);
    
    try {
      const application = applications.find(a => a.id === applicationId);
      
      if (action === 'approve') {
        // Update application status
        await FoundingCircleApplication.update(applicationId, {
          status: 'approved',
          approved_by: user.email,
          approved_at: new Date().toISOString()
        });

        // Try to find and update the user
        const users = await base44.entities.User.filter({ email: application.email });
        if (users && users.length > 0) {
          await base44.entities.User.update(users[0].id, {
            is_founding_circle_lead: true,
            founding_circle_school: application.school,
            founding_circle_approved_at: new Date().toISOString()
          });
        }

        // Send approval email
        try {
          await base44.integrations.Core.SendEmail({
            to: application.email,
            subject: `🎉 Congratulations! You're a Founding Circle Lead for ${application.school}`,
            body: `
Hi ${application.first_name},

Great news! Your application to become a Founding Circle Lead has been approved!

You now have access to:
• $5 one-time bonus per signup (max $200 lifetime)
• 25% monthly commission on each paid family
• 5% override on your recruited ambassadors' earnings

Log in to your dashboard to see your Founding Circle Leader status and access your payment dashboard.

Welcome to the team!

Best,
College Fast Forward Team
            `.trim()
          });
        } catch (emailErr) {
          console.error('Failed to send approval email:', emailErr);
        }

        toast({
          title: "✅ Approved!",
          description: `${application.first_name} ${application.last_name} is now a Founding Circle Lead`,
        });
      } else {
        // Reject
        await FoundingCircleApplication.update(applicationId, {
          status: 'rejected',
          approved_by: user.email
        });

        toast({
          title: "Application Rejected",
          description: "The application has been rejected",
        });
      }

      // Reload applications
      loadApplications();
    } catch (error) {
      console.error('Failed to process application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process application",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Founding Circle Lead Applications
        </CardTitle>
        <Button 
          onClick={loadApplications} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-600" />
            <p className="text-slate-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No pending applications</p>
            <p className="text-sm text-slate-500 mt-1">All applications have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {app.first_name?.charAt(0)}{app.last_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {app.first_name} {app.last_name}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800 mt-1">
                          {app.school}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${app.email}`} className="hover:text-blue-600">
                          {app.email}
                        </a>
                      </div>
                      {app.phone_number && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${app.phone_number}`} className="hover:text-blue-600">
                            {app.phone_number}
                          </a>
                        </div>
                      )}
                      {app.linkedin_url && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <ExternalLink className="w-4 h-4" />
                          <a 
                            href={app.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Applied {new Date(app.created_date).toLocaleDateString()} at {new Date(app.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col md:w-32">
                    <Button
                      onClick={() => handleAction(app.id, 'approve')}
                      disabled={processingId === app.id}
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={processingId === app.id}
                      variant="outline"
                      className="flex-1 md:flex-none border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Processed */}
        <RecentlyProcessedApplications />
      </CardContent>
    </Card>
  );
}

function RecentlyProcessedApplications() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const processed = await FoundingCircleApplication.filter(
          { status: { $in: ['approved', 'rejected'] } },
          '-updated_date',
          10
        );
        setHistory(processed || []);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading || history.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t">
      <h4 className="font-semibold text-slate-900 mb-4">Recently Processed</h4>
      <div className="space-y-2">
        {history.map((app) => (
          <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {app.first_name} {app.last_name}
              </p>
              <p className="text-xs text-slate-500">
                {app.email} • {app.school}
              </p>
            </div>
            <div className="text-right">
              <Badge className={app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {app.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
              </Badge>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(app.updated_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}