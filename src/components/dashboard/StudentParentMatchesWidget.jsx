import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, Building2, Clock, ArrowRight, Loader2, Zap, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career advice',
  'internship_leads': 'Internship leads',
  'resume_review': 'Resume review',
  'interview_prep': 'Interview prep',
  'industry_insights': 'Industry insights',
  'networking_intros': 'Networking intros',
  'informational_interview': 'Informational interviews'
};

function ParentMatchCard({ match, user, onMessageSent }) {
  const [showMessageModal, setShowMessageModal] = useState(false);
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

  // Check for fast responder or high students helped
  const isFastResponder = match.match_reasons?.some(r => r.includes('⚡') || r.includes('Fast') || r.includes('responds'));
  const studentsHelpedMatch = match.match_reasons?.find(r => r.includes('Helped'));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-4">
          <UserAvatar 
            user={{ full_name: match.parent_name, email: match.parent_email }}
            className="w-14 h-14 rounded-full flex-shrink-0"
            showFallback={true}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-lg">{match.parent_name || 'Gator Parent'}</h4>
              {isFastResponder && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" /> Fast Responder
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {match.parent_role || 'Professional'} {match.parent_company && `at ${match.parent_company}`}
            </p>
            
            {/* Match percentage badge */}
            {match.match_percentage && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  🎯 {match.match_percentage}% match
                </span>
              </div>
            )}

            {/* Match reasons from algorithm - prominent display */}
            {match.match_reasons && match.match_reasons.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Why this is a great match:</p>
                <div className="space-y-1">
                  {match.match_reasons.slice(0, 3).map((reason, i) => (
                    <p key={i} className="text-sm text-slate-700">{reason}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Large message button */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => navigate(`MessageComposer?recipient=${match.parent_id}`)}
            className="flex-1 h-12 text-base font-semibold bg-[#FA4616] hover:bg-orange-600 text-white"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Message {match.parent_name?.split(' ')[0] || 'them'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`PublicProfile?id=${match.parent_id}`)}
            className="text-slate-600"
          >
            Profile
          </Button>
        </div>
      </motion.div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Message {match.parent_name?.split(' ')[0] || 'this parent'}
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
  if (matches.length === 0) {
    return null;
  }

  const displayMatches = matches.slice(0, 3);
  const hasMore = matches.length > 3;

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
                💬 People Who Can Answer Your Question ({matches.length})
              </h3>
              <p className="text-sm text-slate-500">Message them directly to start a conversation</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {displayMatches.map(match => (
              <ParentMatchCard 
                key={match.id} 
                match={match} 
                user={user}
                onMessageSent={onRefresh}
              />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('GatorDirectory')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              View All {matches.length} Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}