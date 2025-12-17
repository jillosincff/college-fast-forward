import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Match } from '@/entities/Match';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '@/components/common/UserAvatar';

export default function ParentMatchesWidget({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMatches();
  }, [user?.id]);

  const loadMatches = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const allMatches = await Match.filter({ 
        parent_id: user.id
      }, '-match_score');
      
      setMatches(allMatches || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getHelpTypeLabel = (type) => {
    const labels = {
      career_advice: 'Career advice',
      internship_leads: 'Internship leads',
      resume_review: 'Resume review',
      interview_prep: 'Interview prep',
      industry_insights: 'Industry insights',
      networking_intros: 'Networking intros',
      informational_interview: 'Informational interview'
    };
    return labels[type] || type;
  };

  const getTimelineBadge = (timeline) => {
    const config = {
      this_week: { label: '🔥 This week', className: 'bg-red-100 text-red-800' },
      this_month: { label: 'This month', className: 'bg-orange-100 text-orange-800' },
      no_rush: { label: 'No rush', className: 'bg-green-100 text-green-800' }
    };
    return config[timeline] || { label: timeline, className: 'bg-slate-100 text-slate-800' };
  };

  const getMatchStars = (score) => {
    const count = Math.min(5, Math.ceil(score / 20));
    return '⭐'.repeat(count);
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'urgent') return match.timeline === 'this_week';
    if (filter === 'new') {
      const createdDate = new Date(match.created_date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading students who need your help...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FA4616]" />
            Students You Can Help
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#0021A5]' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('new')}
              className={filter === 'new' ? 'bg-[#0021A5]' : ''}
            >
              New This Week
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('urgent')}
              className={filter === 'urgent' ? 'bg-[#0021A5]' : ''}
            >
              Urgent
            </Button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No matches yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {filter === 'all' 
                ? "When students post requests that match your expertise, they'll appear here."
                : `No ${filter} matches at the moment. Check "All" to see if there are other opportunities.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredMatches.map((match) => {
                const timelineBadge = getTimelineBadge(match.timeline);
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4">
                      <UserAvatar 
                        user={{ full_name: match.student_name }}
                        className="w-16 h-16 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{match.student_name}</h4>
                            <p className="text-sm text-slate-600">
                              {match.student_major} • {match.student_year}
                            </p>
                          </div>
                          <Badge className={`${timelineBadge.className} text-xs whitespace-nowrap`}>
                            {timelineBadge.label}
                          </Badge>
                        </div>

                        {match.help_types && match.help_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.help_types.map((type, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 text-xs">
                                {getHelpTypeLabel(type)}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-slate-700 mb-3 p-3 bg-slate-50 rounded-lg border-l-4 border-[#0021A5]">
                          {match.request_description}
                        </p>

                        {match.match_reasons && match.match_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs font-semibold text-slate-600">Why you're a match:</span>
                            {match.match_reasons.map((reason, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          <span>{getMatchStars(match.match_score)}</span>
                          <span>Match score: {match.match_score}%</span>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-800 font-medium">
                            💡 Students can message you directly. You'll receive an email with their contact info and can respond via email.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}