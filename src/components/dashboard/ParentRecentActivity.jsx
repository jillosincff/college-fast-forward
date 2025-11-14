import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter } from "@/components/router/SimpleRouter";
import { useAuth } from "@/components/auth/AuthContext";
import { JobRequest } from "@/entities/JobRequest";
import { trackEvent } from '@/components/utils/analytics';
import { 
  Clock, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  ArrowRight,
  Users
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

function RequestCard({ request, onOfferHelp }) {
  const jobTypeColors = {
    'internship': 'bg-blue-100 text-blue-800',
    'full_time': 'bg-green-100 text-green-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <h4 className="font-semibold text-slate-900 truncate">{request.role}</h4>
            <Badge className={jobTypeColors[request.job_type] || 'bg-slate-100 text-slate-800'}>
              {request.job_type === 'full_time' ? 'Full-time' : 'Internship'}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{request.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {request.target_industry && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>{request.target_industry}</span>
              </div>
            )}
            {request.location_preference && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{request.location_preference}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        <Button 
          size="sm"
          onClick={() => onOfferHelp(request)}
          className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white flex-shrink-0"
        >
          Offer Help
        </Button>
      </div>
    </motion.div>
  );
}

export default function ParentRecentActivity({ 
  jobRequests = [], 
  roommatePosts = [], 
  helpOffers = [] 
}) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [topRequests, setTopRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasRecentActivity = jobRequests.length > 0 || roommatePosts.length > 0 || helpOffers.length > 0;

  // Load top requests when there's no recent activity
  useEffect(() => {
    if (!hasRecentActivity && !loading) {
      loadTopRequests();
    }
  }, [hasRecentActivity]);

  const loadTopRequests = async () => {
    setLoading(true);
    try {
      // Fetch top 5 recent requests
      const requests = await JobRequest.filter(
        { status: 'active' }, 
        '-created_date', 
        5
      );
      setTopRequests(requests || []);
    } catch (error) {
      console.error('Failed to load top requests:', error);
      setTopRequests([]);
    }
    setLoading(false);
  };

  const handleOfferHelp = (request) => {
    trackEvent('feed_offer_help_clicked', { requestId: request.id });
    navigate('Connections', { highlight: request.id });
  };

  const handleViewAllRequests = () => {
    trackEvent('cta_help_gator_clicked', { location: 'feed' });
    navigate('Connections');
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            {hasRecentActivity ? (
              <>
                <Clock className="w-5 h-5" />
                My Recent Activity
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Students who need help right now
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasRecentActivity ? (
            <div className="space-y-4">
              {helpOffers.slice(0, 3).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-slate-900">You offered help</p>
                    <p className="text-sm text-slate-600">{offer.request_title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(offer.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Sent</Badge>
                </div>
              ))}
              
              {jobRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-slate-900">You posted a request</p>
                    <p className="text-sm text-slate-600">{request.role}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Recent student requests">
              {topRequests.slice(0, 3).map((request) => (
                <div key={request.id} role="listitem">
                  <RequestCard 
                    request={request} 
                    onOfferHelp={handleOfferHelp}
                  />
                </div>
              ))}
              
              {topRequests.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No recent requests available</p>
                  <Button 
                    variant="outline" 
                    onClick={handleViewAllRequests}
                    aria-label="Browse all student requests"
                  >
                    Browse All Requests
                  </Button>
                </div>
              )}
              
              {topRequests.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <Button 
                    variant="link" 
                    onClick={handleViewAllRequests}
                    className="text-[var(--uf-blue)] hover:text-blue-700 p-0 h-auto font-semibold"
                    aria-label="View all student requests"
                  >
                    View All Requests <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}