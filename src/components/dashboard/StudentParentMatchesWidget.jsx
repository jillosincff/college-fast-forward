import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, Building2, Clock, ArrowRight, Loader2, Zap, Star, CheckCircle, TrendingUp, Trash2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';
import { toast } from 'sonner';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career advice',
  'internship_leads': 'Internship leads',
  'resume_review': 'Resume review',
  'interview_prep': 'Interview prep',
  'industry_insights': 'Industry insights',
  'networking_intros': 'Networking intros',
  'informational_interview': 'Informational interviews'
};

// Parse match reasons to extract key stats
function parseMatchStats(reasons = []) {
  const stats = {
    isFastResponder: false,
    responseTime: null,
    studentsHelped: null,
    isSuperHelper: false,
    isRecentlyActive: false,
    isUrgentMatch: false,
    industryMatch: null,
    experience: null
  };
  
  for (const reason of reasons) {
    if (reason.includes('⚡') || reason.includes('Fast') || reason.toLowerCase().includes('responds within')) {
      stats.isFastResponder = true;
      if (reason.includes('hours')) stats.responseTime = 'hours';
      else if (reason.includes('24h')) stats.responseTime = '24h';
      else if (reason.includes('2 days')) stats.responseTime = '2 days';
    }
    if (reason.includes('💨')) stats.responseTime = 'hours';
    if (reason.includes('Helped')) {
      const match = reason.match(/(\d+)\s*students/);
      if (match) stats.studentsHelped = parseInt(match[1]);
    }
    if (reason.includes('🌟') || reason.includes('Top-rated')) stats.isSuperHelper = true;
    if (reason.includes('Recently active')) stats.isRecentlyActive = true;
    if (reason.includes('🚨') || reason.includes('urgent')) stats.isUrgentMatch = true;
    if (reason.includes('industry expert')) {
      const match = reason.match(/^(.+?)\s+industry/);
      if (match) stats.industryMatch = match[1];
    }
    if (reason.includes('years experience')) {
      const match = reason.match(/(\d+\+?)\s*years/);
      if (match) stats.experience = match[1];
    }
  }
  
  return stats;
}

function ParentMatchCard({ match, user, onMessageSent }) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const openMessageModal = () => {
    const helpTypesText = (match.help_types || []).map(t => HELP_TYPE_LABELS[t] || t).join(', ');
    setMessage(`Hi ${match.parent_name?.split(' ')[0] || 'there'},\n\nI came across your profile on the Gator Network and noticed your experience in ${match.parent_industry || 'your field'}. I'm currently looking for ${helpTypesText || 'career guidance'} and would love to connect!\n\nWould you be open to a brief chat?\n\nThank you,\n${user.first_name || user.full_name?.split(' ')[0] || 'A fellow Gator'}`);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        recipient_email: match.parent_email,
        sender_email: user.email,
        subject: `Connection request from ${user.first_name || user.full_name || 'A Gator student'}`,
        body: message,
        post_id: match.help_request_id,
        post_title: match.request_description?.substring(0, 50) || 'Help Request'
      });

      await base44.entities.Match.update(match.id, {
        status: 'student_connected'
      });

      setShowMessageModal(false);
      setMessage('');
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Parse match stats from reasons
  const stats = parseMatchStats(match.match_reasons || []);
  const firstName = match.parent_name?.split(' ')[0] || 'them';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl p-4 border-2 transition-all ${
          stats.isSuperHelper 
            ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-br from-white to-amber-50' 
            : 'border-slate-200 hover:border-blue-300'
        } hover:shadow-lg`}
      >
        {/* Super Helper Banner - compact */}
        {stats.isSuperHelper && (
          <div className="mb-2 -mx-4 -mt-4 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold rounded-t-xl flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" /> Top-Rated Helper
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <UserAvatar 
              user={{ full_name: match.parent_name, email: match.parent_email }}
              className="w-12 h-12 rounded-full"
              showFallback={true}
            />
            {stats.isRecentlyActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Recently active" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900">{match.parent_name || 'Gator Parent'}</h4>
              {match.match_percentage && (
                <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {match.match_percentage}%
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 truncate">
              {match.parent_role || 'Professional'} {match.parent_company && `@ ${match.parent_company}`}
            </p>
            
            {/* Compact badges row */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {stats.isFastResponder && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" /> Fast
                </span>
              )}
              {stats.studentsHelped && stats.studentsHelped >= 5 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> {stats.studentsHelped}+ helped
                </span>
              )}
              {stats.experience && (
                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {stats.experience}y exp
                </span>
              )}
              {stats.isUrgentMatch && (
                <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">
                  🚨 Urgent
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons - vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Button
              onClick={() => navigate(`MessageComposer?recipient=${match.parent_id}`)}
              size="sm"
              className="bg-[#FA4616] hover:bg-orange-600 text-white text-xs px-3"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message {firstName}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`PublicProfile?id=${match.parent_id}`)}
              className="text-slate-500 text-xs px-3"
            >
              View Profile
            </Button>
          </div>
        </div>

        {/* Collapsible match reasons */}
        {match.match_reasons && match.match_reasons.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReasons(!showReasons)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {showReasons ? 'Hide details' : 'See why this is a great match →'}
            </button>
            
            <AnimatePresence>
              {showReasons && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2.5 bg-slate-50 rounded-lg overflow-hidden"
                >
                  <ul className="space-y-1">
                    {match.match_reasons
                      .filter(r => !r.includes('🌟'))
                      .slice(0, 4)
                      .map((reason, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-green-500">✓</span>
                          {reason}
                        </li>
                      ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Message {firstName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 border">
              <p className="font-medium text-slate-900">{match.parent_name}</p>
              <p className="text-sm text-slate-600">
                {match.parent_role} {match.parent_company && `at ${match.parent_company}`}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowMessageModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="flex-1 bg-[#FA4616] hover:bg-orange-600"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function StudentParentMatchesWidget({ user, matches = [], onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearAllMatches = async () => {
    setIsClearing(true);
    try {
      // Delete all matches for this user
      for (const match of matches) {
        await base44.entities.Match.delete(match.id);
      }
      toast.success('All matches cleared. Post a new question to get fresh matches!');
      setShowClearModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to clear matches:', error);
      toast.error('Failed to clear some matches. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };
  
  if (matches.length === 0) {
    return null;
  }

  // Sort and filter matches
  const sortedMatches = [...matches].sort((a, b) => {
    // Super helpers first
    const aSuper = a.match_reasons?.some(r => r.includes('🌟')) ? 1 : 0;
    const bSuper = b.match_reasons?.some(r => r.includes('🌟')) ? 1 : 0;
    if (bSuper !== aSuper) return bSuper - aSuper;
    
    // Then by match score
    return (b.match_score || 0) - (a.match_score || 0);
  });

  // Filter matches
  const filteredMatches = sortedMatches.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'fast') {
      return m.match_reasons?.some(r => 
        r.includes('⚡') || r.includes('Fast') || r.includes('responds within hours') || r.includes('💨')
      );
    }
    if (filter === 'experienced') {
      return m.match_reasons?.some(r => r.includes('15') || r.includes('20+'));
    }
    return true;
  });

  const fastResponderCount = sortedMatches.filter(m => 
    m.match_reasons?.some(r => r.includes('⚡') || r.includes('💨'))
  ).length;

  const displayMatches = filteredMatches.slice(0, 5);
  const hasMore = filteredMatches.length > 5;

  return (
    <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                💬 People Who Can Help ({matches.length})
              </h3>
              <p className="text-sm text-slate-500">Matched based on who can actually help you</p>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Matches
          </button>
          {fastResponderCount > 0 && (
            <button
              onClick={() => setFilter('fast')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'fast' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <Zap className="w-3 h-3" /> Fast Responders ({fastResponderCount})
            </button>
          )}
          <button
            onClick={() => setFilter('experienced')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              filter === 'experienced' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Most Experienced
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayMatches.map(match => (
              <ParentMatchCard 
                key={match.id} 
                match={match} 
                user={user}
                onMessageSent={onRefresh}
              />
            ))}
          </AnimatePresence>
          
          {filteredMatches.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No matches found for this filter.</p>
              <button 
                onClick={() => setFilter('all')}
                className="text-blue-600 underline mt-2"
              >
                Show all matches
              </button>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('MyMatches')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              View All My Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Clear All Matches Option */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearModal(true)}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Matches & Start Fresh
          </Button>
        </div>
      </CardContent>
      
      {/* Clear Matches Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear All Matches?</DialogTitle>
            <DialogDescription>
              This will remove all your current matches so you can get a fresh set.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> To get new matches, you'll need to post a new question or edit your existing one after clearing.
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">
                You currently have <strong>{matches.length}</strong> matches that will be cleared.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowClearModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleClearAllMatches}
                disabled={isClearing}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clear All Matches
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}