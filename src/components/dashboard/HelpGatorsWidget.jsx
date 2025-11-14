import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, Clock, MapPin, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import UserAvatar from '@/components/common/UserAvatar';

export default function HelpGatorsWidget({ matchedRequests, loading, onViewAll }) {
  const { user } = useAuth();
  const [localRequests, setLocalRequests] = useState([]);

  useEffect(() => {
    if (matchedRequests && matchedRequests.length > 0) {
      setLocalRequests(matchedRequests);
    } else {
      // Generate AI-matched mock requests based on user's expertise
      generateMockRequests();
    }
  }, [matchedRequests, user]);

  const generateMockRequests = () => {
    const mockRequests = [
      {
        id: '1',
        role: 'Software Engineer Intern',
        description: 'Looking for a summer internship at a tech company. Interested in full-stack development and would love advice from someone in the industry.',
        target_industry: 'Technology',
        location_preference: 'San Francisco Bay Area',
        created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user_name: 'Alex Rodriguez',
        user_grad_year: 2025,
        urgency: 'Urgent',
        poster_profile_image: null
      },
      {
        id: '2',
        role: 'Finance Analyst',
        description: 'Recent graduate seeking entry-level opportunities in investment banking or corporate finance. Would appreciate any connections or advice.',
        target_industry: 'Finance',
        location_preference: 'New York',
        created_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        user_name: 'Maria Santos',
        user_grad_year: 2024,
        urgency: 'Normal',
        poster_profile_image: null
      },
      {
        id: '3',
        role: 'Marketing Coordinator',
        description: 'Looking to transition into digital marketing. Seeking mentorship and potential opportunities at growth-stage companies.',
        target_industry: 'Marketing',
        location_preference: 'Austin, TX',
        created_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        user_name: 'Jordan Kim',
        user_grad_year: 2023,
        urgency: 'Normal',
        poster_profile_image: null
      }
    ];

    // Filter based on user's industry/expertise
    const filtered = mockRequests.filter(req => {
      if (user?.current_company?.toLowerCase().includes('tech') || user?.current_position?.toLowerCase().includes('engineer')) {
        return req.target_industry === 'Technology';
      }
      if (user?.current_company?.toLowerCase().includes('finance') || user?.current_position?.toLowerCase().includes('finance')) {
        return req.target_industry === 'Finance';
      }
      return true;
    }).slice(0, 3);

    setLocalRequests(filtered);
  };

  const handleHelpClick = (request) => {
    trackEvent('help_gator_clicked', { 
      requestId: request.id, 
      requestType: request.role,
      alumniIndustry: user?.current_company 
    });
    // In real app, this would open a help modal or navigate to detail page
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="w-6 h-6 text-red-500" />
          </motion.div>
          <div>
            <div className="text-xl font-bold text-slate-900">Help a Gator</div>
            <div className="text-sm text-slate-600 font-normal">
              {localRequests.length} students need your expertise
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence>
          {localRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-slate-900 mb-2">No Matches Yet</h3>
              <p className="text-slate-600 text-sm mb-4">
                We're finding Gators who could use your expertise.
              </p>
              <Button onClick={onViewAll} variant="outline">
                Browse All Requests
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {localRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar 
                      user={{ 
                        full_name: request.user_name,
                        profile_image: request.poster_profile_image 
                      }} 
                      className="w-10 h-10" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800">{request.role}</h4>
                        {request.urgency === 'Urgent' && (
                          <Badge className={getUrgencyColor(request.urgency)}>
                            <Zap className="w-3 h-3 mr-1" />
                            {request.urgency}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-medium">{request.user_name}</span>
                        <span>Class of '{request.user_grad_year}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(request.created_date)}
                        </div>
                        {request.location_preference && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {request.location_preference}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleHelpClick(request)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Help
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              <Button 
                onClick={onViewAll}
                variant="outline" 
                className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                View All Student Requests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}