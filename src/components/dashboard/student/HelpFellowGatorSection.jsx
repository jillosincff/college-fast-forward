import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';

function PeerQuestionCard({ question, user, onAnswered }) {
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timeAgo = moment(question.created_date).fromNow();
  const isJobRequest = !!question.role;
  const title = isJobRequest 
    ? question.description?.slice(0, 120) 
    : question.description?.slice(0, 120);
  const industry = question.target_industry || question.industry || '';
  const helpTypes = question.help_types || [];

  const tags = [
    industry,
    ...helpTypes.slice(0, 1).map(h => h.replace(/_/g, ' '))
  ].filter(Boolean);

  const handleSubmit = async () => {
    if (!answerText.trim() || answerText.trim().length < 20) return;
    setSubmitting(true);
    try {
      if (isJobRequest) {
        await base44.entities.JobAnswer.create({
          job_request_id: question.id,
          responder_id: user.id,
          responder_email: user.email,
          responder_name: user.full_name || user.email.split('@')[0],
          responder_type: 'gator',
          message: answerText.trim(),
        });
        // Increment answer count
        await base44.entities.JobRequest.update(question.id, {
          answer_count: (question.answer_count || 0) + 1
        });
      } else {
        await base44.entities.Answer.create({
          question_id: question.id,
          question_type: 'HelpRequest',
          answerer_user_id: user.id,
          answerer_email: user.email,
          answerer_name: user.full_name || user.email.split('@')[0],
          answerer_persona: 'gator',
          answer_text: answerText.trim(),
        });
        await base44.entities.HelpRequest.update(question.id, {
          answer_count: (question.answer_count || 0) + 1
        });
      }

      // Award student karma
      try {
        await base44.functions.invoke('awardStudentKarma', {
          userId: user.id,
          userEmail: user.email,
          actionType: 'answer_question',
          referenceId: question.id,
          description: 'Answered a fellow Gator\'s question'
        });
      } catch (e) {
        console.log('Karma award failed (non-critical):', e.message);
      }

      setSubmitted(true);
      if (onAnswered) onAnswered();
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center">
        <div className="text-2xl mb-1">✅</div>
        <p className="font-semibold text-green-800 text-sm">Answer submitted! +5 karma</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
      <p className="text-sm font-medium text-slate-900 leading-snug mb-2">
        "{title}{question.description?.length > 120 ? '...' : ''}"
      </p>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="inline-flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
          <Sparkles className="w-3 h-3 mr-1" /> Matches your background
        </span>
        {tags.map((tag, i) => (
          <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {timeAgo}
        </span>
      </div>

      {!answering ? (
        <Button
          size="sm"
          onClick={() => setAnswering(true)}
          className="bg-[#0021A5] hover:bg-blue-800 text-white text-xs"
        >
          Answer This +5 karma
        </Button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Share your experience or advice..."
            className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {answerText.length < 20 ? `${20 - answerText.length} more chars needed` : '✓ Ready'}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setAnswering(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={answerText.trim().length < 20 || submitting}
                className="bg-[#0021A5] hover:bg-blue-800 text-white text-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpFellowGatorSection({ user }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadMatchingQuestions();
  }, [user?.id]);

  const loadMatchingQuestions = async () => {
    setLoading(true);
    try {
      // Gather user's background for matching
      const userMajor = (user.major || '').toLowerCase();
      const userIndustries = (user.industries_of_interest || user.target_industries || []).map(i => i.toLowerCase());
      const userHelpNeeded = user.help_needed || user.student_help_needed || [];

      // Fetch recent active questions from other students
      const [jobRequests, helpRequests] = await Promise.all([
        base44.entities.JobRequest.filter({ status: 'active', poster_type: 'student' }, '-created_date', 20),
        base44.entities.HelpRequest.filter({ status: 'active', poster_type: 'student' }, '-created_date', 20),
      ]);

      // Combine and filter out own questions
      const allQuestions = [
        ...(jobRequests || []).map(q => ({ ...q, _type: 'job' })),
        ...(helpRequests || []).map(q => ({ ...q, _type: 'help' })),
      ].filter(q => {
        const authorEmail = q.poster_email || q.student_email || q.created_by || '';
        return authorEmail.toLowerCase() !== user.email.toLowerCase() &&
               q.created_by?.toLowerCase() !== user.email.toLowerCase();
      });

      // Score each question for relevance
      const scored = allQuestions.map(q => {
        let score = 0;

        // Industry match
        const qIndustry = (q.target_industry || q.industry || '').toLowerCase();
        const qIndustries = (q.target_industries || []).map(i => i.toLowerCase());
        if (qIndustry && userIndustries.some(ui => qIndustry.includes(ui) || ui.includes(qIndustry))) score += 3;
        if (qIndustries.some(qi => userIndustries.some(ui => qi.includes(ui) || ui.includes(qi)))) score += 3;

        // Major match (check if question description mentions user's major)
        if (userMajor && q.description?.toLowerCase().includes(userMajor)) score += 2;
        if (userMajor && (q.student_major || '').toLowerCase().includes(userMajor)) score += 1;

        // Help type overlap
        const qHelpTypes = q.help_types || [];
        const overlap = qHelpTypes.filter(ht => userHelpNeeded.includes(ht));
        score += overlap.length;

        // Recency bonus (less than 3 days old)
        const ageHours = (Date.now() - new Date(q.created_date).getTime()) / (1000 * 60 * 60);
        if (ageHours < 72) score += 1;

        // Low answer count bonus (needs help)
        if ((q.answer_count || 0) === 0) score += 2;
        else if ((q.answer_count || 0) < 3) score += 1;

        return { ...q, _relevanceScore: score };
      });

      // Sort by relevance, take top 2 with score > 0
      const matched = scored
        .filter(q => q._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore)
        .slice(0, 2);

      setQuestions(matched);
    } catch (err) {
      console.error('Failed to load peer questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if loading or no matching questions
  if (loading || questions.length === 0) return null;

  return (
    <Card className="bg-white border-2 border-blue-100 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900">Help a Fellow Gator</h3>
              <p className="text-xs text-slate-500">Students in your field need your perspective</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
            +5 karma
          </span>
        </div>

        <div className="space-y-3">
          {questions.map(q => (
            <PeerQuestionCard
              key={q.id}
              question={q}
              user={user}
              onAnswered={loadMatchingQuestions}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-semibold"
          onClick={() => navigate('Connections')}
        >
          See All Student Questions <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}