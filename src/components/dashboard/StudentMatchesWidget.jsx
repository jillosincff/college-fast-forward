import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Users, Briefcase, MessageSquare, ArrowRight, Sparkles, Loader2, Building2, Clock, GraduationCap, Handshake, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career advice',
  'internship_leads': 'Internship leads',
  'resume_review': 'Resume review',
  'interview_prep': 'Interview prep',
  'industry_insights': 'Industry insights',
  'networking_intros': 'Networking intros',
  'informational_interview': 'Informational interviews'
};

const COLLAB_LABELS = {
  'resume_review': 'Resume feedback',
  'interview_prep': 'Interview prep',
  'internship_search': 'Internship search',
  'certifications': 'Certifications',
  'study_groups': 'Study groups',
  'career_development': 'Career development'
};

function ParentMatchCard({ match, onConnect, isBroader = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-xl p-4 transition-all ${
        isBroader 
          ? 'border-2 border-dashed border-slate-300 bg-slate-50/50' 
          : 'border-2 border-slate-200 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {match.parent_name?.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {match.parent_name || 'Gator Parent'}
                </p>
                {isBroader && (
                  <Badge className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    Broader match
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {match.parent_role || 'Professional'} {match.parent_company && `at ${match.parent_company}`}
              </p>
            </div>
          </div>

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
              <Badge className={`text-xs ${isBroader ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                {match.match_score} pts
              </Badge>
            )}
          </div>

          {match.match_reasons?.length > 0 && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-1">
              ✨ {match.match_reasons.slice(0, 2).join(' • ')}
            </p>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => onConnect(match)}
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
              Message
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function PeerMatchCard({ match, onConnect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl p-4 border-2 border-teal-200 hover:border-teal-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-white font-bold">
              {match.peer_name?.charAt(0) || 'G'}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {match.peer_name || 'Fellow Gator'}
              </p>
              <p className="text-sm text-slate-600">
                {match.peer_year} • {match.peer_major}
              </p>
            </div>
          </div>

          {match.peer_working_on && (
            <div className="mt-2 text-sm">
              <span className="font-medium text-slate-700">Working on: </span>
              <span className="text-slate-600">{match.peer_working_on}</span>
            </div>
          )}

          {match.peer_can_share && (
            <div className="mt-1 text-sm">
              <span className="font-medium text-slate-700">Can share: </span>
              <span className="text-slate-600">{match.peer_can_share}</span>
            </div>
          )}

          {match.peer_collaborate_on?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {match.peer_collaborate_on.slice(0, 3).map(area => (
                <Badge key={area} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                  {COLLAB_LABELS[area] || area}
                </Badge>
              ))}
            </div>
          )}

          {match.match_reasons?.length > 0 && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-1">
              ✨ {match.match_reasons.slice(0, 2).join(' • ')}
            </p>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => onConnect(match)}
          disabled={match.status === 'student_connected'}
          className={match.status === 'student_connected' 
            ? 'bg-green-100 text-green-700 hover:bg-green-100'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
          }
        >
          {match.status === 'student_connected' ? (
            <>✓ Connected</>
          ) : (
            <>
              <Handshake className="w-4 h-4 mr-1" />
              Connect
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function StudentMatchesWidget({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showBroaderMatches, setShowBroaderMatches] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMatches();
    }
  }, [user?.id]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const studentMatches = await base44.entities.Match.filter(
        { student_id: user.id },
        '-match_score',
        50
      );
      
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

  const handleConnectParent = (match) => {
    setSelectedMatch(match);
    const helpTypesText = (match.help_types || []).map(t => HELP_TYPE_LABELS[t] || t).join(', ');
    setMessage(`Hi ${match.parent_name?.split(' ')[0] || 'there'},\n\nI came across your profile on the Gator Network and noticed your experience in ${match.parent_industry || 'your field'}. I'm currently looking for ${helpTypesText || 'career guidance'} and would love to connect!\n\nWould you be open to a brief chat?\n\nThank you,\n${user.first_name || user.full_name?.split(' ')[0] || 'A fellow Gator'}`);
    setShowMessageModal(true);
  };

  const handleConnectPeer = (match) => {
    setSelectedMatch(match);
    const commonInterest = match.peer_major || 'our shared interests';
    const helpTypesText = (match.help_types || []).map(t => HELP_TYPE_LABELS[t] || t).join(', ');
    setMessage(`Hey ${match.peer_name?.split(' ')[0] || 'there'}!\n\nI saw we're both ${user.major || 'students'} navigating ${commonInterest}. I'd love to connect and swap experiences - maybe we can help each other out?\n\nI'm specifically working on ${helpTypesText || 'career development'} and saw you're open to collaborating on this. Would you be up for a quick chat?\n\nThanks!\n${user.first_name || user.full_name?.split(' ')[0] || 'A fellow Gator'}`);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedMatch) return;
    
    setSending(true);
    try {
      const isPeer = selectedMatch.match_type === 'peer';
      const recipientEmail = isPeer 
        ? selectedMatch.peer_email 
        : (selectedMatch.parent_email || `parent_${selectedMatch.parent_id}@gator.network`);
      const recipientName = isPeer ? selectedMatch.peer_name : selectedMatch.parent_name;

      await base44.entities.Message.create({
        recipient_email: recipientEmail,
        sender_email: user.email,
        subject: isPeer 
          ? `Collaboration request from ${user.first_name || user.full_name || 'A Gator student'}`
          : `Connection request from ${user.first_name || user.full_name || 'A Gator student'}`,
        body: message,
        post_id: selectedMatch.help_request_id,
        post_title: selectedMatch.request_description?.substring(0, 50) || 'Help Request'
      });

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

  // Separate matches by type and category
  const parentMatches = matches.filter(m => m.match_type === 'parent' || !m.match_type);
  const peerMatches = matches.filter(m => m.match_type === 'peer');
  const highQualityParentMatches = parentMatches.filter(m => m.match_category === 'high' || m.match_score >= 20);
  const broaderParentMatches = parentMatches.filter(m => m.match_category === 'broader' && m.match_score < 20);

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
    // Show encouraging empty state instead of hiding
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Matches</h3>
                <p className="text-sm text-slate-600">Parents and peers who can help you</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-purple-200 text-center">
              <p className="text-lg text-slate-700 mb-2">🔍 Finding your matches...</p>
              <p className="text-sm text-slate-500">
                Complete your help request to get matched with Gator parents and peers who can assist with your career goals.
              </p>
              <Button
                onClick={() => navigate('Connections')}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Browse Emerging Gators
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
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
                    Your Matches & Collaboration Opportunities
                  </h3>
                  <p className="text-sm text-slate-600">
                    Connect with parents, alumni, and fellow Gators
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {matches.length} total
              </Badge>
            </div>

            {/* SECTION 1: Parents & Alumni */}
            {parentMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-slate-900">
                    💼 Parents & Alumni ({parentMatches.length} matches)
                  </h4>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Industry professionals with hiring connections and career expertise
                </p>

                {/* High-quality matches */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {highQualityParentMatches.slice(0, 3).map((match, index) => (
                      <ParentMatchCard
                        key={match.id}
                        match={match}
                        onConnect={handleConnectParent}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Broader matches section */}
                {broaderParentMatches.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowBroaderMatches(!showBroaderMatches)}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {showBroaderMatches ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>Additional Parents Who Might Help ({broaderParentMatches.length})</span>
                    </button>
                    
                    {showBroaderMatches && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-slate-500 italic">
                          These parents aren't perfect matches, but they may still be able to help or point you in the right direction
                        </p>
                        <AnimatePresence>
                          {broaderParentMatches.map((match) => (
                            <ParentMatchCard
                              key={match.id}
                              match={match}
                              onConnect={handleConnectParent}
                              isBroader={true}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {highQualityParentMatches.length > 3 && (
                  <div className="mt-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('GatorDirectory')}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      View all {highQualityParentMatches.length} parent matches
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: Fellow Gators (Peers) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900">
                  🤝 Fellow Gators to Collaborate With ({peerMatches.length} matches)
                </h4>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Students with similar backgrounds navigating similar paths
              </p>

              {peerMatches.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {peerMatches.slice(0, 3).map((match) => (
                      <PeerMatchCard
                        key={match.id}
                        match={match}
                        onConnect={handleConnectPeer}
                      />
                    ))}
                  </AnimatePresence>

                  {peerMatches.length > 3 && (
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('GatorDirectory')}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        View all {peerMatches.length} peer matches
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 text-center">
                  <p className="text-teal-700 text-sm">
                    No peer matches yet - encourage other students to opt into collaboration!
                  </p>
                </div>
              )}
            </div>

            {/* All connected state */}
            {matches.length > 0 && matches.every(m => m.status === 'student_connected') && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
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
              {selectedMatch?.match_type === 'peer' ? (
                <>
                  <Handshake className="w-5 h-5 text-teal-600" />
                  Connect with {selectedMatch?.peer_name?.split(' ')[0] || 'this student'}
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Connect with {selectedMatch?.parent_name?.split(' ')[0] || 'this parent'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMatch && (
              <div className={`rounded-lg p-3 border ${
                selectedMatch.match_type === 'peer' 
                  ? 'bg-teal-50 border-teal-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="font-medium text-slate-900">
                  {selectedMatch.match_type === 'peer' ? selectedMatch.peer_name : selectedMatch.parent_name}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedMatch.match_type === 'peer' 
                    ? `${selectedMatch.peer_year} • ${selectedMatch.peer_major}`
                    : `${selectedMatch.parent_role} ${selectedMatch.parent_company && `at ${selectedMatch.parent_company}`}`
                  }
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
                placeholder="Introduce yourself and explain how you'd like to connect..."
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
                className={`flex-1 ${
                  selectedMatch?.match_type === 'peer'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
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