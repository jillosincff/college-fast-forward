import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Users, Briefcase, MessageSquare, ArrowRight, Sparkles, Loader2, Building2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function StudentMatchesWidget({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMatches();
    }
  }, [user?.id]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Get matches where this student is matched
      const studentMatches = await base44.entities.Match.filter(
        { student_id: user.id },
        '-match_score',
        10
      );
      
      // Filter for pending/active matches only
      const activeMatches = (studentMatches || []).filter(m => 
        m.status === 'pending' || m.status === 'student_connected'
      );
      
      setMatches(activeMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (match) => {
    setSelectedMatch(match);
    setMessage(`Hi ${match.parent_name?.split(' ')[0] || 'there'},\n\nI came across your profile on the Gator Network and noticed your experience in ${match.parent_industry || 'your field'}. I'm currently looking for ${match.help_types?.join(', ') || 'career guidance'} and would love to connect!\n\nWould you be open to a brief chat?\n\nThank you,\n${user.first_name || user.full_name?.split(' ')[0] || 'A fellow Gator'}`);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedMatch) return;
    
    setSending(true);
    try {
      // Create message
      await base44.entities.Message.create({
        recipient_email: selectedMatch.parent_email || `parent_${selectedMatch.parent_id}@gator.network`,
        sender_email: user.email,
        subject: `Connection request from ${user.first_name || user.full_name || 'A Gator student'}`,
        body: message,
        post_id: selectedMatch.help_request_id,
        post_title: selectedMatch.request_description?.substring(0, 50) || 'Help Request'
      });

      // Update match status
      await base44.entities.Match.update(selectedMatch.id, {
        status: 'student_connected'
      });

      setShowMessageModal(false);
      setSelectedMatch(null);
      setMessage('');
      await loadMatches();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return null; // Don't show widget if no matches
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
          <CardContent className="pt-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Your Matches
                  </h3>
                  <p className="text-sm text-slate-600">
                    Gator parents who can help you
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </Badge>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              <AnimatePresence>
                {matches.slice(0, 3).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Parent Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {match.parent_name?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {match.parent_name || 'Gator Parent'}
                            </p>
                            <p className="text-sm text-slate-600">
                              {match.parent_role || 'Professional'} {match.parent_company && `at ${match.parent_company}`}
                            </p>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {match.parent_industry && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <Building2 className="w-3 h-3 mr-1" />
                              {match.parent_industry}
                            </Badge>
                          )}
                          {match.parent_years_experience && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {match.parent_years_experience} years
                            </Badge>
                          )}
                          {match.match_score && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              {match.match_score}% match
                            </Badge>
                          )}
                        </div>

                        {/* Match Reasons */}
                        {match.match_reasons?.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                            ✨ {match.match_reasons.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        onClick={() => handleConnect(match)}
                        disabled={match.status === 'student_connected'}
                        className={match.status === 'student_connected' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }
                      >
                        {match.status === 'student_connected' ? (
                          <>✓ Reached out</>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* View All Link */}
            {matches.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('Connections')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View all {matches.length} matches
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Empty state encouragement */}
            {matches.length > 0 && matches.every(m => m.status === 'student_connected') && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-green-700 font-medium">
                  🎉 Great job! You've reached out to all your matches.
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Check back soon for new matches!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Connect with {selectedMatch?.parent_name?.split(' ')[0] || 'this parent'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMatch && (
              <div className="bg-slate-50 rounded-lg p-3 border">
                <p className="font-medium text-slate-900">{selectedMatch.parent_name}</p>
                <p className="text-sm text-slate-600">
                  {selectedMatch.parent_role} {selectedMatch.parent_company && `at ${selectedMatch.parent_company}`}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Introduce yourself and explain how they can help..."
                className="text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMessageModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}