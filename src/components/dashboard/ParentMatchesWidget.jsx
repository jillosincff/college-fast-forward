import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Match } from '@/entities/Match';
import { ParentExpertise } from '@/entities/ParentExpertise';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Users, Filter, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '@/components/common/UserAvatar';

export default function ParentMatchesWidget({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [user?.id]);

  const loadMatches = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const allMatches = await Match.filter({ 
        parent_id: user.id,
        status: { $in: ['pending', 'student_connected'] }
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

  const handleOfferHelp = (match) => {
    setSelectedMatch(match);
    
    const helpTypesList = (match.help_types || []).map(getHelpTypeLabel).join(', ');
    const message = `Hi ${match.student_name?.split(' ')[0] || 'there'},

I saw your request for ${helpTypesList} and I'd love to help! I'm a ${match.parent_role || 'professional'} with ${match.parent_years_experience || 'experience'} in ${match.parent_industry || 'the industry'}.

${match.request_description ? `Regarding your note: "${match.request_description.substring(0, 100)}${match.request_description.length > 100 ? '...' : ''}"` : ''}

I'd be happy to chat and share my insights. When works for you?

Best,
${user?.full_name || ''}`;
    
    setOfferMessage(message);
    setShowOfferModal(true);
  };

  const sendOfferToHelp = async () => {
    if (!selectedMatch || !offerMessage.trim()) return;
    
    setIsSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: selectedMatch.student_email,
        subject: `🐊 ${user?.full_name || 'A Gator Parent'} wants to help with your request`,
        body: offerMessage
      });

      await Match.update(selectedMatch.id, { status: 'parent_reached_out' });
      
      setMatches(prev => prev.map(match =>
        match.id === selectedMatch.id
          ? { ...match, status: 'parent_reached_out' }
          : match
      ));
      
      setShowOfferModal(false);
      setSelectedMatch(null);
      setOfferMessage('');
    } catch (error) {
      console.error('Failed to send offer:', error);
      alert('Failed to send offer. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePass = async (matchId) => {
    try {
      await Match.update(matchId, { status: 'passed' });
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (error) {
      console.error('Failed to pass on match:', error);
    }
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
    <>
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#FA4616]" />
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

                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                            <span>{getMatchStars(match.match_score)}</span>
                            <span>Match score: {match.match_score}%</span>
                          </div>

                          <div className="flex gap-2">
                            {match.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => handleOfferHelp(match)}
                                  className="bg-[#FA4616] hover:bg-[#E03D0F] flex-1"
                                  size="sm"
                                >
                                  <Heart className="w-4 h-4 mr-2" />
                                  Offer to Help
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handlePass(match.id)}
                                  size="sm"
                                >
                                  Not Right Now
                                </Button>
                              </>
                            )}
                            {match.status === 'student_connected' && (
                              <Button
                                onClick={() => handleOfferHelp(match)}
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                size="sm"
                              >
                                Student Reached Out - Respond
                              </Button>
                            )}
                            {match.status === 'parent_reached_out' && (
                              <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
                                ⏳ Waiting for student response...
                              </Badge>
                            )}
                            {match.status === 'connected' && (
                              <Badge className="bg-green-100 text-green-800 px-4 py-2">
                                ✓ Connected!
                              </Badge>
                            )}
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

      {/* Offer Help Modal */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#FA4616]">Offer to Help</DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <UserAvatar 
                  user={{ full_name: selectedMatch.student_name }}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-bold text-slate-900">{selectedMatch.student_name}</p>
                  <p className="text-sm text-slate-600">
                    {selectedMatch.student_major} • {selectedMatch.student_year}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your message to the student:
                </label>
                <Textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  rows={8}
                  placeholder="Introduce yourself and offer your help..."
                  className="text-sm"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">
                  💡 Your message will be sent directly to the student's email. They'll be able to respond and connect with you.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1"
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendOfferToHelp}
                  disabled={!offerMessage.trim() || isSending}
                  className="flex-1 bg-[#FA4616] hover:bg-[#E03D0F]"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Offer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}