import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobRequest } from '@/entities/JobRequest';
import { formatDistanceToNow } from 'date-fns';

// Simple navigation function
const navigate = (page) => {
  window.location.hash = `#${page}`;
};

export default function StudentsNeedHelpFeed() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Load recent active requests
      const activeRequests = await JobRequest.filter(
        { status: 'active' }, 
        '-created_date', 
        5
      );
      setRequests(activeRequests || []);
    } catch (error) {
      console.error("[components/dashboard/StudentsNeedHelpFeed.js] Could not load requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email || typeof email !== 'string') return 'S';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'internship':
        return 'bg-blue-100 text-blue-700';
      case 'full_time':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Heart className="w-6 h-6 text-red-500" />
            Students Who Need Help Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Heart className="w-6 h-6 text-red-500" />
            Students Who Need Help Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate('Connections')}
                  >
                    <div className="flex items-start gap-3">
                      {/* Student Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getInitials(request.created_by)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {request.role || request.title || 'Help Request'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <Badge className={`text-xs ${getJobTypeColor(request.job_type)}`}>
                                {request.job_type === 'full_time' ? 'Full-Time' : 'Internship'}
                              </Badge>
                              {request.target_industry && (
                                <Badge variant="outline" className="text-xs">
                                  {request.target_industry}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {truncateText(request.description)}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {request.location_preference && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {request.location_preference}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('Connections');
                            }}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Offer Help
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => navigate('Connections')}
              >
                View All Requests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-4">No active requests right now</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('Connections')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Check Back Soon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}