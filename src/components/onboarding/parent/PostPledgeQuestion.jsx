import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, Clock, Tag, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// Scoring: prioritize industry match, then unanswered, then recent
function scoreQuestion(q, userIndustries) {
  let score = 0;
  const qIndustries = q.target_industries?.length > 0
    ? q.target_industries
    : q.target_industry ? [q.target_industry] : [];
  
  if (qIndustries.length > 0 && userIndustries.some(i => qIndustries.includes(i))) {
    score += 50;
  }
  if ((q.answer_count || 0) === 0) score += 30;
  // Prefer recent
  const ageHours = (Date.now() - new Date(q.created_date).getTime()) / (1000 * 60 * 60);
  if (ageHours < 48) score += 20;
  else if (ageHours < 168) score += 10;
  return score;
}

function parseFirstName(name) {
  if (!name) return 'A student';
  const parts = name.split(',').map(p => p.trim());
  if (parts.length >= 2) return parts[1].split(' ')[0] || parts[1];
  return name.split(' ')[0];
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function PostPledgeQuestion({ user, formData, onComplete }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  const userIndustries = user?.industries || formData?.industries || [];
  const firstName = user?.full_name?.includes(',')
    ? user.full_name.split(',')[1]?.trim().split(/\s+/)[0] || 'Parent'
    : user?.full_name?.trim().split(/\s+/)[0] || 'Parent';

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      // Fetch from both JobRequest and HelpRequest for wider pool
      const [jobQuestions, helpQuestions] = await Promise.all([
        base44.entities.JobRequest.filter(
          { status: 'active', poster_type: 'student' },
          '-created_date',
          100
        ).catch(() => []),
        base44.entities.HelpRequest.filter(
          { status: 'active' },
          '-created_date',
          100
        ).catch(() => []),
      ]);

      // Normalize HelpRequests to look like JobRequests for scoring
      const normalizedHelp = (helpQuestions || []).map(q => ({
        ...q,
        _source: 'help',
        poster_name: q.student_name || q.poster_name,
        poster_email: q.student_email,
        poster_first_name: q.student_name?.split(' ')[0],
        student_major: q.student_major,
        student_year: q.student_year,
        target_industry: q.industry,
        target_industries: q.industry ? [q.industry] : [],
        title: q.description,
        role: q.description?.slice(0, 60),
      }));

      const normalizedJob = (jobQuestions || []).map(q => ({ ...q, _source: 'job' }));
      const allQuestions = [...normalizedJob, ...normalizedHelp];

      if (allQuestions.length === 0) {
        await markShown(false);
        onComplete({ skipped: true, noQuestions: true });
        return;
      }

      // Priority 1: Linked student's question
      const linkedStudentEmails = user?.student_emails || [];
      if (linkedStudentEmails.length > 0) {
        const studentQ = allQuestions.find(q => {
          const posterEmail = q.poster_email || q.student_email || q.created_by;
          return posterEmail && linkedStudentEmails.includes(posterEmail);
        });
        if (studentQ) {
          setQuestion(studentQ);
          setLoading(false);
          return;
        }
      }

      // Priority 2: Score and sort by relevance
      const scored = allQuestions
        .map(q => ({ ...q, _score: scoreQuestion(q, userIndustries) }))
        .sort((a, b) => b._score - a._score);

      setQuestion(scored[0]);
    } catch (err) {
      console.error('Failed to load post-pledge question:', err);
      await markShown(false);
      onComplete({ skipped: true, error: true });
      return;
    } finally {
      setLoading(false);
    }
  };

  const markShown = async (answered) => {
    try {
      await base44.auth.updateMe({
        first_question_shown: true,
        first_question_answered: !!answered,
      });
    } catch (e) {
      console.log('Failed to mark first_question_shown:', e.message);
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim() || submitting) return;

    // Gentle nudge for very short answers
    if (answerText.trim().length < 40 && !showNudge) {
      setShowNudge(true);
      return;
    }

    setSubmitting(true);
    try {
      const isHelpRequest = question._source === 'help';

      if (isHelpRequest) {
        // Create Answer entity for HelpRequest
        await base44.entities.Answer.create({
          question_id: question.id,
          question_type: 'HelpRequest',
          answerer_user_id: user.id,
          answerer_email: user.email,
          answerer_name: user.full_name,
          answerer_title: user.job_title || user.current_position || formData?.jobTitle || '',
          answerer_company: user.company || user.current_company || formData?.company || '',
          answerer_persona: 'parent',
          answer_text: answerText.trim(),
          upvote_count: 0,
          is_best_answer: false,
        });
        // Update answer count
        try {
          await base44.entities.HelpRequest.update(question.id, {
            answer_count: (question.answer_count || 0) + 1,
          });
        } catch {}
      } else {
        // Create JobAnswer for JobRequest
        await base44.entities.JobAnswer.create({
          job_request_id: question.id,
          responder_id: user.id,
          responder_email: user.email,
          responder_name: user.full_name,
          responder_title: user.job_title || user.current_position || formData?.jobTitle || '',
          responder_company: user.company || user.current_company || formData?.company || '',
          responder_type: 'parent',
          message: answerText.trim(),
          is_read: false,
          is_helpful: false,
          upvote_count: 0,
        });
        // Update answer count
        try {
          await base44.entities.JobRequest.update(question.id, {
            answer_count: (question.answer_count || 0) + 1,
          });
        } catch {}
      }

      // Award karma (non-critical)
      try {
        await base44.functions.invoke('awardKarma', {
          familyGroupId: user.family_group_id || null,
          parentUserId: user.id,
          parentEmail: user.email,
          parentName: user.full_name,
          actionType: 'answer',
          referenceType: 'job_answer',
          referenceId: `post_pledge_${question.id}_${Date.now()}`,
          description: 'Answered first question after CFF Pledge',
        });
      } catch (e) {
        console.log('Post-pledge karma failed:', e.message);
      }

      // Send notification to student (non-critical, fire-and-forget)
      const posterEmail = question.poster_email || question.student_email;
      if (posterEmail && posterEmail.includes('@') && posterEmail !== user.email) {
        base44.functions.invoke('sendAnswerNotification', {
          questionId: question.id,
          questionTitle: question.title || question.role || 'Your question',
          posterEmail,
          posterName: question.poster_first_name || parseFirstName(question.poster_name),
          answererName: user.full_name,
          answererTitle: user.job_title || formData?.jobTitle || '',
          answererCompany: user.company || formData?.company || '',
          answerPreview: answerText.trim(),
        }).catch(() => {});
      }

      // Track analytics
      try {
        base44.analytics.track({
          eventName: 'post_pledge_question_answered',
          properties: {
            question_id: question.id,
            question_source: question._source || 'job',
            answer_length: answerText.trim().length,
            is_linked_student: isLinkedStudent,
          },
        });
      } catch {}

      await markShown(true);

      // Celebration
      setSubmitted(true);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#0021A5', '#FA4616', '#FFD700'],
      });
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // Store skipped question ID + source for dashboard banner
    if (question?.id) {
      localStorage.setItem('skipped_pledge_question_id', question.id);
      localStorage.setItem('skipped_pledge_question_source', question._source || 'job');
    }
    try {
      base44.analytics.track({
        eventName: 'post_pledge_question_skipped',
        properties: { question_id: question?.id, question_source: question._source },
      });
    } catch {}
    await markShown(false);
    onComplete({ skipped: true });
  };

  const handleGoToDashboard = () => {
    onComplete({ answered: true, questionId: question?.id });
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin" />
          <p className="text-slate-500 text-sm">Finding a student who needs your help...</p>
        </div>
      </div>
    );
  }

  // Should not happen (we skip if no question), but safety net
  if (!question) return null;

  const studentName = parseFirstName(question.poster_name);
  const isLinkedStudent = (user?.student_emails || []).some(email => {
    const posterEmail = question.poster_email || question.student_email || question.created_by;
    return posterEmail && email === posterEmail;
  });
  const matchedIndustry = userIndustries.find(i => {
    const qInd = question.target_industries?.length > 0
      ? question.target_industries
      : question.target_industry ? [question.target_industry] : [];
    return qInd.includes(i);
  });

  // ═══════════════════════════════════════════════
  // SUCCESS STATE — after submitting answer
  // ═══════════════════════════════════════════════
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: '#fafbfc' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col items-center text-center"
        >
          <span className="text-5xl mb-4">🎉</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            That's what this network is about.
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-8">
            You just helped a UF student within your first minute.
          </p>

          {/* Success checklist */}
          <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <span>🤝</span>
              <span className="flex-1">Pledge: taken</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <span>💬</span>
              <span className="flex-1">First answer: sent</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <span>⭐</span>
              <span className="flex-1">Karma: +15</span>
              <span className="text-green-600 font-semibold text-xs">earned</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <span>📊</span>
              <span className="flex-1">Your student's position: boosted</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-8">
            {studentName} will be notified of your answer.
          </p>

          <button
            onClick={handleGoToDashboard}
            className="w-full max-w-sm py-4 px-8 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001a8a] transition-all shadow-lg"
          >
            See My Dashboard →
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN STATE — question + answer box
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 md:py-16" style={{ background: '#fafbfc' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl flex flex-col items-center"
      >
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 text-center">
          {isLinkedStudent
            ? `You're in. And ${studentName} already needs you.`
            : "You're in. And someone already needs you."}
        </h1>
        <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-8">
          {isLinkedStudent
            ? "Your student already posted a question. You're the perfect person to help."
            : "This student posted a question that matches your background. You're one of the first people who can help."}
        </p>

        {/* Question Card */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
          {/* Student info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-[#0021A5] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {(question.poster_name || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-base truncate">
                {question.poster_name || 'A UF Student'}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {[question.student_major, question.student_year].filter(Boolean).join(' · ') || 'UF Student'}
              </p>
            </div>
          </div>

          {/* Question text */}
          <p className="text-slate-800 text-base md:text-lg leading-relaxed italic mb-4">
            "{question.description || question.title || question.role}"
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(question.target_industry || question.target_industries?.[0]) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                <Tag className="w-3 h-3" />
                {question.target_industry || question.target_industries[0]}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              Posted {timeAgo(question.created_date)}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
              {question.answer_count || 0} answers
            </span>
          </div>

          {/* Match indicator */}
          {isLinkedStudent ? (
            <p className="text-sm text-green-700 font-medium">
              ✅ This is your student's question
            </p>
          ) : matchedIndustry ? (
            <p className="text-sm text-green-700 font-medium">
              ✅ Matches your {matchedIndustry} background
            </p>
          ) : null}
        </div>

        {/* Answer Section */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Your answer:
          </label>
          <textarea
            value={answerText}
            onChange={(e) => {
              setAnswerText(e.target.value);
              if (showNudge) setShowNudge(false);
            }}
            placeholder="Share what you know. Even a few sentences can change their direction..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base resize-vertical
                       focus:border-[#0021A5] focus:outline-none transition-colors leading-relaxed"
          />

          {/* Short answer nudge */}
          <AnimatePresence>
            {showNudge && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-amber-600 mt-2"
              >
                Even one more sentence could make a big difference for {studentName}. Send anyway?
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            disabled={!answerText.trim() || submitting}
            className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              answerText.trim()
                ? 'bg-[#0021A5] text-white shadow-[0_4px_15px_rgba(0,33,165,0.3)] hover:bg-[#001a8a] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showNudge ? (
              <>
                <Send className="w-5 h-5" />
                Send Anyway — +15 Karma ✨
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send My Answer — +15 Karma ✨
              </>
            )}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-slate-600 text-sm underline transition-colors py-2"
        >
          Skip for now — take me to my dashboard →
        </button>
      </motion.div>
    </div>
  );
}