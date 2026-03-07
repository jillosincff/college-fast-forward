import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, Eye, MessageSquare, ChevronDown, ChevronUp, 
  Send, Loader2, ThumbsUp, Award, ArrowRight, Star
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.floor(diffHours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function roleLabel(persona) {
  if (persona === 'parent') return 'UF Parent';
  if (persona === 'alumni') return 'UF Alum';
  if (persona === 'gator') return 'UF Student';
  return '';
}

function AnswerCard({ answer, user, isExpanded, onToggle }) {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replySent, setReplySent] = useState(false);

  const name = answer.answerer_name || answer.responder_name || 'UF Community Member';
  const persona = answer.answerer_persona || answer.responder_type || '';
  const role = roleLabel(persona);
  const title = answer.answerer_title || answer.responder_title || '';
  const company = answer.answerer_company || answer.responder_company || '';
  const text = answer.answer_text || answer.message || '';
  const initials = name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  const isBestAnswer = answer.is_best_answer || answer.is_helpful;

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      const recipientEmail = answer.answerer_email || answer.responder_email;
      if (!recipientEmail) return;

      await base44.entities.Message.create({
        sender_email: user.email,
        sender_name: user.full_name || user.email.split('@')[0],
        recipient_email: recipientEmail,
        subject: `Re: Your answer`,
        body: replyText.trim(),
        is_read: false,
        message_type: 'text'
      });

      // Notify
      base44.functions.invoke('sendMessageNotification', {
        recipientEmail,
        senderName: user.full_name || user.email.split('@')[0],
        senderEmail: user.email,
        subject: 'Reply to your answer',
        messageBody: replyText.trim()
      }).catch(() => {});

      setReplyText('');
      setReplySent(true);
      setTimeout(() => setReplySent(false), 3000);
    } catch (e) {
      console.error('Reply failed:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`border rounded-xl transition-all ${isExpanded ? 'border-blue-200 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
      <button onClick={onToggle} className="w-full text-left p-3.5 focus:outline-none">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="font-semibold text-slate-900 text-sm">{name}</span>
              {role && <span className="text-xs text-slate-400">· {role}</span>}
              {isBestAnswer && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0 h-4">
                  <Star className="w-2.5 h-2.5 mr-0.5" /> Best
                </Badge>
              )}
            </div>
            {(title || company) && (
              <p className="text-xs text-slate-500 mb-1">
                {title}{title && company ? ' at ' : ''}{company}
              </p>
            )}
            {!isExpanded && (
              <p className="text-sm text-slate-600 line-clamp-2">{text}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-slate-400">{formatTimeAgo(answer.created_date)}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 border-t border-slate-100">
              <p className="text-sm text-slate-700 whitespace-pre-wrap mt-3 leading-relaxed">{text}</p>

              {/* Reply section */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                {replySent ? (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Reply sent! They'll see it in their messages.
                  </p>
                ) : (
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Thank ${name.split(' ')[0]} or ask a follow-up...`}
                      className="flex-1 min-h-[40px] max-h-24 resize-none text-sm"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSending}
                      size="icon"
                      className="bg-[#0021A5] hover:bg-[#001580] h-9 w-9 flex-shrink-0"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RequestWithResponses({ helpRequest, user }) {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnswerId, setExpandedAnswerId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const isJobRequest = !!helpRequest.role;
  const title = helpRequest.role || helpRequest.title || helpRequest.description?.substring(0, 60);
  const answerCount = helpRequest.answer_count || 0;
  const viewCount = helpRequest.view_count || helpRequest.views_count || 0;

  useEffect(() => {
    loadAnswers();
  }, [helpRequest.id]);

  const loadAnswers = async () => {
    setLoading(true);
    try {
      let results = [];
      
      // Try Answer entity first (community answers)
      try {
        const communityAnswers = await base44.entities.Answer.filter(
          { question_id: helpRequest.id },
          '-created_date',
          20
        );
        results = [...(communityAnswers || [])];
      } catch (e) {
        console.log('Answer load failed:', e.message);
      }

      // Also try JobAnswer entity
      if (isJobRequest) {
        try {
          const jobAnswers = await base44.entities.JobAnswer.filter(
            { job_request_id: helpRequest.id },
            '-created_date',
            20
          );
          results = [...results, ...(jobAnswers || [])];
        } catch (e) {
          console.log('JobAnswer load failed:', e.message);
        }
      }

      // Sort by date, newest first
      results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setAnswers(results);
    } catch (e) {
      console.error('Failed to load answers:', e);
    } finally {
      setLoading(false);
    }
  };

  const displayedAnswers = showAll ? answers : answers.slice(0, 3);
  const hasMore = answers.length > 3 && !showAll;

  return (
    <Card className="bg-white border-2 border-slate-200 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-5">
        {/* Request header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Your Help Request</h3>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Active</span>
        </div>

        <p className="text-slate-800 font-medium mb-2 line-clamp-2">{title}</p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {answers.length || answerCount} {(answers.length || answerCount) === 1 ? 'response' : 'responses'}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {viewCount} views
          </span>
        </div>

        {/* Answers inline */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-slate-500">Loading responses...</span>
          </div>
        ) : answers.length > 0 ? (
          <div className="space-y-2.5 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Responses from the Gator network
            </h4>
            {displayedAnswers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                user={user}
                isExpanded={expandedAnswerId === answer.id}
                onToggle={() => setExpandedAnswerId(expandedAnswerId === answer.id ? null : answer.id)}
              />
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(true)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Show all {answers.length} responses <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-50 rounded-lg mb-4">
            <p className="text-sm text-slate-500">No responses yet — hang tight, the Gator network is on it!</p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => {
            const type = isJobRequest ? 'job' : 'help';
            navigate(`QuestionDetail?id=${helpRequest.id}&type=${type}`);
          }}
        >
          View Full Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}