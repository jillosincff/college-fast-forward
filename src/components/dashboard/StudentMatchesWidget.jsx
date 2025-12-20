import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Users, Briefcase, MessageSquare, ArrowRight, Sparkles, Loader2, Building2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
            : 'bg-[#FA4616] hover:bg-[#e63e13] text-white'
          }
        >
          {match.status === 'student_connected' ? (
            <>✓ Sent</>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-1" />
              Connect
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}



// VERSION: 2025-12-20-v3-FORCE-REBUILD
export default function StudentMatchesWidget({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showBroaderMatches, setShowBroaderMatches] = useState(false);
  const [isRefreshingMatches, setIsRefreshingMatches] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadMatches();
      loadHelpRequests();
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

  const loadHelpRequests = async () => {
    setLoadingRequests(true);
    try {
      console.log('🔍 DEBUG - User ID:', user.id);
      console.log('🔍 DEBUG - User email:', user.email);
      
      // Try filtering by student_id first
      let requests = await base44.entities.HelpRequest.filter(
        { student_id: user.id, status: 'active' },
        '-created_date',
        10
      );
      
      console.log('🔍 DEBUG - Requests by student_id:', requests?.length || 0);
      
      // If no results, try by email (fallback)
      if (!requests || requests.length === 0) {
        console.log('🔍 DEBUG - Trying by student_email instead...');
        requests = await base44.entities.HelpRequest.filter(
          { student_email: user.email, status: 'active' },
          '-created_date',
          10
        );
        console.log('🔍 DEBUG - Requests by student_email:', requests?.length || 0);
      }
      
      setHelpRequests(requests || []);
    } catch (error) {
      console.error('Failed to load help requests:', error);
      setHelpRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFindNewMatches = async () => {
    if (helpRequests.length === 0) return;
    
    setIsRefreshingMatches(true);
    setRefreshResult(null);

    try {
      let totalNewMatches = 0;
      let parentMatches = 0;
      let peerMatches = 0;

      for (const request of helpRequests) {
        const { data: result } = await base44.functions.invoke('generateMatches', {
          help_request_id: request.id,
          mode: 'for_request'
        });

        if (result?.matches_created) {
          totalNewMatches += result.matches_created;
          parentMatches += result.parent_matches || 0;
          peerMatches += result.peer_matches || 0;
        }
      }

      await loadMatches();

      const totalMatches = matches.length + totalNewMatches;

      setRefreshResult({
        newMatches: totalNewMatches,
        totalMatches: totalMatches,
        breakdown: { parents: parentMatches, peers: peerMatches }
      });

      setTimeout(() => setRefreshResult(null), 8000);

    } catch (error) {
      console.error('Error refreshing matches:', error);
      setRefreshResult({
        newMatches: 0,
        totalMatches: matches.length,
        breakdown: { parents: 0, peers: 0 },
        error: true
      });
    } finally {
      setIsRefreshingMatches(false);
    }
  };

  const handleConnectParent = (match) => {
    setSelectedMatch(match);
    const helpTypesText = (match.help_types || []).map(t => HELP_TYPE_LABELS[t] || t).join(', ');
    setMessage(`Hi ${match.parent_name?.split(' ')[0] || 'there'},\n\nI came across your profile on the Gator Network and noticed your experience in ${match.parent_industry || 'your field'}. I'm currently looking for ${helpTypesText || 'career guidance'} and would love to connect!\n\nWould you be open to a brief chat?\n\nThank you,\n${user.first_name || user.full_name?.split(' ')[0] || 'A fellow Gator'}`);
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

  const parentMatches = matches.filter(m => m.match_type === 'parent' || !m.match_type);
  const highQualityParentMatches = parentMatches.filter(m => m.match_category === 'high' || m.match_score >= 20);
  const broaderParentMatches = parentMatches.filter(m => m.match_category === 'broader' && m.match_score < 20);

  if (loading || loadingRequests) {
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

  // EMPTY STATE - No matches yet - Modern dark theme design
  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card 
          className="overflow-hidden border-0 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
          }}
        >
          <CardContent className="p-0">
            
            {/* Hero Section with Gradient Overlay */}
            <div 
              className="relative px-6 py-12 md:px-12 md:py-16"
              style={{
                background: 'linear-gradient(135deg, rgba(250, 70, 22, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
              }}
            >
              
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                
                {/* Main Headline */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
                    <span className="text-2xl">🚀</span>
                    <span className="text-orange-200 text-sm font-semibold uppercase tracking-wider">
                      Launch Your Network
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Get Connected with<br />
                    <span 
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #FA4616 0%, #fb923c 100%)'
                      }}
                    >
                      People Who Can Help
                    </span>
                  </h1>
                  
                  <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Match with industry pros and fellow students who want to see you succeed
                  </p>
                </div>

                {/* Feature Cards - Side by Side with Modern Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-4xl mx-auto">
                  
                  {/* Parents & Alumni Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative overflow-hidden rounded-2xl p-6 cursor-default"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                      border: '2px solid rgba(251, 146, 60, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="text-5xl mb-3">💼</div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        Parents & Alumni
                        <span className="text-xs px-2 py-1 bg-orange-500/30 text-orange-200 rounded-full font-semibold">
                          PRO
                        </span>
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Industry veterans with hiring power, insider knowledge, and career wisdom
                      </p>
                      
                      {/* Quick stats */}
                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="text-green-400">●</span> Active now
                        </span>
                        <span>|</span>
                        <span>Career advice • Job leads • Mentorship</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Fellow Gators Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative overflow-hidden rounded-2xl p-6 cursor-default"
                    style={{
                      background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.15) 0%, rgba(45, 212, 191, 0.1) 100%)',
                      border: '2px solid rgba(94, 234, 212, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-teal-400/0 group-hover:from-teal-400/10 group-hover:to-transparent transition-all duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="text-5xl mb-3">🤝</div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        Fellow Gators
                        <span className="text-xs px-2 py-1 bg-teal-400/30 text-teal-200 rounded-full font-semibold">
                          PEER
                        </span>
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Students like you navigating the same journey - share experiences and grow together
                      </p>
                      
                      {/* Quick stats */}
                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="text-green-400">●</span> Online now
                        </span>
                        <span>|</span>
                        <span>Resume swaps • Interview prep • Study groups</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* How It Works - Streamlined */}
                <div className="max-w-2xl mx-auto mb-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <span className="text-slate-200 font-medium">Post what you need</span>
                    </div>
                    
                    <div className="hidden md:block text-slate-500">→</div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <span className="text-slate-200 font-medium">We find matches</span>
                    </div>
                    
                    <div className="hidden md:block text-slate-500">→</div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <span className="text-slate-200 font-medium">Start connecting</span>
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                  {helpRequests.length > 0 ? (
                    <>
                      <Button
                        onClick={handleFindNewMatches}
                        disabled={isRefreshingMatches}
                        className="group relative px-10 py-6 text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:shadow-orange-500/50 hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(135deg, #FA4616 0%, #ea580c 100%)',
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isRefreshingMatches ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Finding Your Matches...
                            </>
                          ) : (
                            <>
                              🔍 Find My Matches
                              <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                →
                              </motion.span>
                            </>
                          )}
                        </span>
                        
                        {/* Animated gradient overlay on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/0 via-orange-400/30 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                      
                      <p className="text-slate-400 text-sm mt-4">
                        ✅ Profile ready • Instant matches • Free forever
                      </p>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate('StudentOnboarding')}
                        className="group relative px-10 py-6 text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:shadow-orange-500/50 hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(135deg, #FA4616 0%, #ea580c 100%)',
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Create Your First Request
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.span>
                        </span>
                        
                        {/* Animated gradient overlay on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/0 via-orange-400/30 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                      
                      <p className="text-slate-400 text-sm mt-4">
                        Free forever • No credit card • Instant matches
                      </p>
                    </>
                  )}
                  
                  {/* Social proof */}
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-slate-900"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-900"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-slate-900"></div>
                    </div>
                    <span className="text-slate-300 text-sm font-medium">
                      Join <span className="text-orange-400 font-bold">100+</span> Gators already connected
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom tip bar */}
            <div 
              className="px-6 py-4 text-center"
              style={{
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <p className="text-slate-300 text-sm flex items-center justify-center gap-2 flex-wrap">
                <span className="text-lg">💡</span>
                <span>
                  <strong className="text-white">New members join daily</strong> — you can re-run matching anytime to discover fresh connections
                </span>
              </p>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // HAS MATCHES - Show the match cards
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
          <CardContent className="pt-6 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Your Matches & Collaboration Opportunities
                  </h3>
                  <p className="text-sm text-slate-600">
                    New parents & students join daily – refresh to find fresh connections
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFindNewMatches}
                  disabled={isRefreshingMatches || helpRequests.length === 0}
                  className="border-2 border-[#FA4616] text-[#FA4616] hover:bg-orange-50 font-semibold"
                >
                  {isRefreshingMatches ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>🔄 Find New Matches</>
                  )}
                </Button>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {matches.length} total
                </Badge>
              </div>
            </div>

            {/* Refresh Results Banner */}
            {refreshResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-4 p-4 mb-6 rounded-xl border-l-4 ${
                  refreshResult.newMatches > 0 
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="text-3xl flex-shrink-0">
                  {refreshResult.newMatches > 0 ? '✨' : 'ℹ️'}
                </div>
                <div className="flex-1">
                  {refreshResult.newMatches > 0 ? (
                    <>
                      <p className="font-bold text-amber-900">
                        Found {refreshResult.newMatches} new match{refreshResult.newMatches !== 1 ? 'es' : ''}!
                      </p>
                      <p className="text-sm text-amber-800">
                        {refreshResult.breakdown.parents > 0 && `${refreshResult.breakdown.parents} parent${refreshResult.breakdown.parents !== 1 ? 's' : ''}`}
                        {refreshResult.breakdown.parents > 0 && refreshResult.breakdown.peers > 0 && ' and '}
                        {refreshResult.breakdown.peers > 0 && `${refreshResult.breakdown.peers} peer${refreshResult.breakdown.peers !== 1 ? 's' : ''}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-blue-900">No new matches found</p>
                      <p className="text-sm text-blue-800">
                        You already have all current matches. Check back tomorrow as new members join!
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setRefreshResult(null)}
                  className="w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
                >
                  ×
                </button>
              </motion.div>
            )}

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

                <div className="space-y-3">
                  <AnimatePresence>
                    {highQualityParentMatches.slice(0, 3).map((match) => (
                      <ParentMatchCard
                        key={match.id}
                        match={match}
                        onConnect={handleConnectParent}
                      />
                    ))}
                  </AnimatePresence>
                </div>

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
                className="flex-1 bg-[#FA4616] hover:bg-[#e63e13]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Connection Request
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