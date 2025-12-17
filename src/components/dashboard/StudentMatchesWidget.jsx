import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { HelpRequest } from '@/entities/HelpRequest';
import { Match } from '@/entities/Match';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '@/components/common/UserAvatar';

export default function StudentMatchesWidget({ user }) {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadHelpRequests();
  }, [user?.id]);

  const loadHelpRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const requests = await HelpRequest.filter({ student_id: user.id, status: 'active' }, '-created_date');
      
      const requestsWithMatches = await Promise.all(
        requests.map(async (request) => {
          const matches = await Match.filter({ 
            help_request_id: request.id
          }, '-match_score');
          
          return {
            ...request,
            matches: matches || []
          };
        })
      );
      
      setHelpRequests(requestsWithMatches);
      
      if (requestsWithMatches.length > 0) {
        setExpandedRequestId(requestsWithMatches[0].id);
      }
    } catch (error) {
      console.error('Failed to load help requests:', error);
      setHelpRequests([]);
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
      this_week: { label: 'This week', className: 'bg-red-100 text-red-800' },
      this_month: { label: 'This month', className: 'bg-orange-100 text-orange-800' },
      no_rush: { label: 'No rush', className: 'bg-green-100 text-green-800' }
    };
    return config[timeline] || { label: timeline, className: 'bg-slate-100 text-slate-800' };
  };

  const getMatchStars = (score) => {
    const count = Math.min(5, Math.ceil(score / 20));
    return '⭐'.repeat(count);
  };

  const handleMessage = (match, request) => {
    setSelectedMatch({ ...match, request });
    
    const helpTypesList = request.help_types.map(getHelpTypeLabel).join(', ');
    const message = `Hi ${match.parent_name?.split(' ')[0] || 'there'},

I saw you're a great match for my request for ${helpTypesList}. I'm a ${request.student_year || 'student'} studying ${request.student_major || 'at UF'}.

${request.description}

Would you have time for a quick conversation?

Thanks so much!
${user?.first_name || user?.full_name || ''}`;
    
    setMessageText(message);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedMatch || !messageText.trim()) return;
    
    setIsSending(true);
    try {
      await base44.functions.invoke('sendStudentMessageToParent', {
        match_id: selectedMatch.id,
        message: messageText,
        parent_email: selectedMatch.parent_email,
        parent_name: selectedMatch.parent_name
      });
      
      setShowMessageModal(false);
      setSelectedMatch(null);
      setMessageText('');
      
      alert('Message sent! The parent will receive your email and can respond directly to you.');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseRequest = async (requestId) => {
    if (!confirm('Close this request and remove all matches?')) return;
    
    try {
      const result = await base44.functions.invoke('closeHelpRequest', { 
        help_request_id: requestId 
      });
      
      if (result.data?.success) {
        setHelpRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to close request:', error);
      alert('Failed to close request. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading your matches...</p>
        </CardContent>
      </Card>
    );
  }

  if (helpRequests.length === 0) {
    return (
      <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">🙋‍♀️</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to get career help?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Tell us what you need help with and we'll match you with experienced Gator parents who can help.
          </p>
          <Button 
            onClick={() => window.location.href = '/#PostRequest'}
            className="bg-[#FA4616] hover:bg-[#E03D0F]"
          >
            Request Help
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FA4616]" />
              Your Help Requests & Matches
            </h2>
          </div>

          <div className="space-y-4">
            {helpRequests.map((request) => {
              const isExpanded = expandedRequestId === request.id;
              const visibleMatches = isExpanded ? request.matches : request.matches.slice(0, 3);
              const timelineBadge = getTimelineBadge(request.timeline);

              return (
                <div key={request.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2">
                        {request.help_types.map(getHelpTypeLabel).join(', ')} - {request.industry}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`${timelineBadge.className} text-xs`}>
                          {timelineBadge.label}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Posted {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCloseRequest(request.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-slate-700 mb-4 p-3 bg-white rounded-lg border-l-4 border-[#FA4616]">
                    {request.description}
                  </p>

                  {request.matches.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-bold text-amber-900">
                        ✨ {request.matches.length} Parent Match{request.matches.length !== 1 ? 'es' : ''} Found
                      </p>
                    </div>
                  )}

                  {/* Parent Matches */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {visibleMatches.map((match) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex gap-4">
                            <UserAvatar 
                              user={{ full_name: match.parent_name }}
                              className="w-16 h-16 flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900">{match.parent_name}</h4>
                              <p className="text-sm text-slate-600 font-medium">{match.parent_role}</p>
                              <p className="text-xs text-slate-500">
                                {match.parent_industry} • {match.parent_years_experience}
                              </p>
                              
                              {match.match_reasons && match.match_reasons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {match.match_reasons.map((reason, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                <span>{getMatchStars(match.match_score)}</span>
                                <span>Match score: {match.match_score}%</span>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => handleMessage(match, request)}
                                className="bg-[#FA4616] hover:bg-[#E03D0F] whitespace-nowrap"
                                size="sm"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {request.matches.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 text-[#FA4616] border-[#FA4616] hover:bg-orange-50"
                      onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show all {request.matches.length} matches
                        </>
                      )}
                    </Button>
                  )}
                  
                  {request.matches.length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-slate-200">
                      <p className="text-slate-500">
                        No matches yet. We'll notify you when parents match your request!
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0021A5]">Message Parent</DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <UserAvatar 
                  user={{ full_name: selectedMatch.parent_name }}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-bold text-slate-900">{selectedMatch.parent_name}</p>
                  <p className="text-sm text-slate-600">{selectedMatch.parent_role}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your message:
                </label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={8}
                  placeholder="Introduce yourself and explain what help you're looking for..."
                  className="text-sm"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 Your message will be sent to the parent's email. They can respond directly to you.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1"
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="flex-1 bg-[#FA4616] hover:bg-[#E03D0F]"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </>
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