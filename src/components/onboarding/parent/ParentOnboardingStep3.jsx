import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { JobRequest } from '@/entities/JobRequest';
import { Loader2, RefreshCw, Send, Users, ChevronRight } from 'lucide-react';
import ReferralModal from './ReferralModal';

// Map student help_types to parent ways_to_help
const HELP_TYPE_MAPPING = {
  direction: 'career_guidance',
  salary: 'career_guidance',
  job_search: 'jobs_referrals',
  resume: 'resume_interviews',
  interviews: 'resume_interviews',
  industry_insights: 'industry_insights',
  networking: 'introductions',
  grad_school: 'grad_school'
};

// Scoring function - supports both legacy target_industry and new target_industries array
function scoreQuestion(question, parentIndustries, parentWaysToHelp) {
  let score = 0;
  
  // Map student help_types to parent taxonomy
  const mappedHelpTypes = (question.help_types || [])
    .map(ht => HELP_TYPE_MAPPING[ht])
    .filter(Boolean);
  
  // Help type match (+50)
  const helpOverlap = mappedHelpTypes.some(ht => parentWaysToHelp.includes(ht));
  if (helpOverlap) score += 50;
  
  // Industry match - support both array and legacy string
  const studentIndustries = question.target_industries?.length > 0 
    ? question.target_industries 
    : (question.target_industry ? [question.target_industry] : []);
  
  if (studentIndustries.length > 0) {
    // Student specified industries - check for overlap
    const industryOverlap = studentIndustries.some(ind => parentIndustries.includes(ind));
    if (industryOverlap) {
      score += 40;
    }
  } else {
    // "Anyone" selected or no industry = partial credit
    score += 10;
  }
  
  // Age boosts
  const ageInDays = (Date.now() - new Date(question.created_date).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays > 7) score += 15;
  if (ageInDays > 30) score += 10;
  
  return score;
}

// Parse student name from "Last, First" format
function parseStudentName(posterName) {
  if (!posterName) return 'A student';
  const parts = posterName.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    // "Fronte, Lia A." -> "Lia"
    const firstName = parts[1].split(' ')[0];
    return firstName || parts[1];
  }
  return posterName.split(' ')[0] || 'A student';
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

const HELP_TYPE_LABELS = {
  job_search: 'Job Search',
  resume: 'Resume Help',
  interviews: 'Interview Prep',
  networking: 'Networking',
  direction: 'Career Direction',
  industry_insights: 'Industry Insights',
  grad_school: 'Grad School',
  salary: 'Salary Advice'
};

export default function ParentOnboardingStep3({ 
  formData, 
  onComplete,
  onBack,
  user
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noQuestions, setNoQuestions] = useState(false);
  const [flowType, setFlowType] = useState(null); // 'matched' | 'noMatch' | 'empty'
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [referralName, setReferralName] = useState('');

  // Different limits based on flow type
  const MAX_SKIPS_MATCHED = 4;
  const MAX_SKIPS_NO_MATCH = 2;
  const MAX_QUESTIONS = 5; // Total questions to show

  useEffect(() => {
    loadMatchingQuestions();
  }, []);

  const loadMatchingQuestions = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Fetch active student questions
      const allQuestions = await JobRequest.filter(
        { status: 'active', poster_type: 'student', is_alumni_career_request: false },
        'created_date', // oldest first for FIFO tiebreaker
        200
      );

      if (allQuestions.length === 0) {
        setFlowType('empty');
        setNoQuestions(true);
        // Ensure minimum 1.5s loading time
        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
        setLoading(false);
        return;
      }

      // Score and filter questions
      const parentIndustries = formData.industries || [];
      const parentWaysToHelp = formData.waysToHelp || [];

      const scoredQuestions = allQuestions
        .map(q => ({
          ...q,
          matchScore: scoreQuestion(q, parentIndustries, parentWaysToHelp)
        }))
        .sort((a, b) => {
          // Sort by score descending, then by age (older first) for tiebreaker
          if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
          return new Date(a.created_date) - new Date(b.created_date);
        });

      // Check if we have good matches (score >= 50)
      const goodMatches = scoredQuestions.filter(q => q.matchScore >= 50);
      
      console.log('[ParentOnboardingStep3] Scoring results:', {
        totalQuestions: allQuestions.length,
        goodMatchesCount: goodMatches.length,
        topScores: scoredQuestions.slice(0, 5).map(q => ({ id: q.id, score: q.matchScore, title: q.title?.slice(0, 30) }))
      });
      
      if (goodMatches.length > 0) {
        // Matched flow - show up to 5 best matches
        console.log('[ParentOnboardingStep3] Setting MATCHED flow with', goodMatches.length, 'questions');
        setFlowType('matched');
        setQuestions(goodMatches.slice(0, MAX_QUESTIONS));
      } else {
        // No match flow - show oldest unanswered questions (up to 3)
        console.log('[ParentOnboardingStep3] No good matches, trying NO_MATCH flow');
        const oldestUnanswered = allQuestions
          .filter(q => (q.answer_count || 0) === 0)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
          .slice(0, 3);
        
        console.log('[ParentOnboardingStep3] Oldest unanswered count:', oldestUnanswered.length);
        
        if (oldestUnanswered.length > 0) {
          setFlowType('noMatch');
          setQuestions(oldestUnanswered.map(q => ({ ...q, matchScore: 0 })));
        } else {
          // All questions have been answered - but we still have questions, just show some
          console.log('[ParentOnboardingStep3] All questions answered, showing top scored anyway');
          if (scoredQuestions.length > 0) {
            setFlowType('noMatch');
            setQuestions(scoredQuestions.slice(0, 3));
          } else {
            setFlowType('empty');
            setNoQuestions(true);
          }
        }
      }
      
      // Ensure minimum 1.5s loading time for effect
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
      
    } catch (error) {
      console.error('Failed to load questions:', error);
      setFlowType('empty');
      setNoQuestions(true);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleSkip = () => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    setShowAnswerInput(false);
    setAnswerText('');

    const maxSkips = flowType === 'matched' ? MAX_SKIPS_MATCHED : MAX_SKIPS_NO_MATCH;

    if (newSkipCount >= maxSkips || currentIndex >= questions.length - 1) {
      // Graceful exit
      onComplete({ skippedAll: true, flowType });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAnswerClick = () => {
    setShowAnswerInput(true);
  };

  const handleSubmitAnswer = async () => {
    if (answerText.trim().length < 50) return;

    setSubmitting(true);
    try {
      // Create the answer
      await base44.entities.Answer.create({
        question_id: currentQuestion.id,
        question_type: 'JobRequest',
        answerer_email: user.email,
        answerer_name: user.full_name,
        answerer_title: formData.jobTitle,
        answerer_company: formData.company,
        answerer_persona: 'parent',
        answer_text: answerText.trim(),
        upvote_count: 0,
        is_best_answer: false
      });

      // Update question answer count
      await JobRequest.update(currentQuestion.id, {
        answer_count: (currentQuestion.answer_count || 0) + 1
      });

      // Complete with success
      onComplete({ 
        answeredQuestion: true, 
        questionId: currentQuestion.id,
        studentName: parseStudentName(currentQuestion.poster_name),
        flowType
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReferral = () => {
    setShowReferralModal(true);
  };

  const handleReferralSuccess = (referredName) => {
    setShowReferralModal(false);
    setReferralName(referredName || 'your contact');
    setShowReferralSuccess(true);
  };

  const handleContinueAfterReferral = () => {
    setShowReferralSuccess(false);
    if (currentIndex >= questions.length - 1) {
      onComplete({ referredSomeone: true, flowType });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin mb-4" />
        <p className="text-slate-600">Finding a student who needs your help...</p>
      </div>
    );
  }

  // No questions at all - everything answered
  if (noQuestions && flowType === 'empty') {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Great news—all student questions have been answered!
          </h2>
          <p className="text-slate-600 mb-6">
            We'll notify you when new questions come in.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={() => onComplete({ noQuestions: true, flowType: 'empty' })}
            className="flex-1 py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
          >
            Go to My Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // Referral success screen
  if (showReferralSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🙏</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Thanks for the referral!
          </h2>
          <p className="text-slate-600 mb-6">
            We'll reach out to {referralName} and let you know if they're able to help.
          </p>
          <p className="text-slate-500 text-sm">
            Want to see another question, or continue to your dashboard?
          </p>
        </div>

        <div className="space-y-3">
          {currentIndex < questions.length - 1 && (
            <button
              onClick={handleContinueAfterReferral}
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
            >
              Show Another Question
            </button>
          )}
          <button
            onClick={() => onComplete({ referredSomeone: true, flowType })}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              currentIndex < questions.length - 1
                ? 'border-2 border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
            }`}
          >
            Go to My Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // If no current question but we have questions array, something's wrong
  if (!currentQuestion && questions.length > 0) {
    console.error('No current question but questions exist', { currentIndex, questionsLength: questions.length });
  }

  // If we somehow have no questions to show (but didn't hit noQuestions state), show empty
  if (!currentQuestion) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#0021A5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            No questions available right now
          </h2>
          <p className="text-slate-600 mb-6">
            We'll notify you when students need your help!
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={() => onComplete({ noQuestions: true, flowType: flowType || 'empty' })}
            className="flex-1 py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
          >
            Go to My Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // Question display
  const studentName = parseStudentName(currentQuestion?.poster_name);
  const maxQuestions = flowType === 'matched' ? MAX_SKIPS_MATCHED + 1 : MAX_SKIPS_NO_MATCH;

  // Header copy based on flow type
  const headerText = flowType === 'matched' 
    ? "One more thing: a UF student needs your help right now."
    : "We don't have a perfect match for your expertise right now—but maybe you can still help?";
  
  const subheaderText = flowType === 'matched'
    ? "Based on what you just told us, you might be the perfect person to answer this."
    : null;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
            {flowType === 'matched' ? 'One more thing' : 'Help a Gator?'}
          </h2>
          <span className="text-sm text-slate-500">
            Question {currentIndex + 1} of {Math.min(maxQuestions, questions.length)}
          </span>
        </div>
        <p className="text-slate-600">
          {headerText}
        </p>
        {subheaderText && (
          <p className="text-slate-500 text-sm mt-1">
            {subheaderText}
          </p>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0021A5] to-[#001580] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{studentName}</p>
              <p className="text-sm text-white/80">
                {currentQuestion.student_major && `${currentQuestion.student_major} `}
                {currentQuestion.student_year && `'${String(currentQuestion.student_year).slice(-2)}`}
                {' • Posted '}
                {formatRelativeTime(currentQuestion.created_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Help type badges */}
          {currentQuestion.help_types && currentQuestion.help_types.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuestion.help_types.slice(0, 4).map(ht => (
                <span 
                  key={ht}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {HELP_TYPE_LABELS[ht] || ht}
                </span>
              ))}
            </div>
          )}

          {/* Question text */}
          <p className="text-slate-800 text-base leading-relaxed">
            {currentQuestion.description || currentQuestion.title}
          </p>
        </div>
      </div>

      {/* Answer Input */}
      {showAnswerInput ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What advice would you give {studentName}?
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Share your experience, tips, or encouragement..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                       resize-none h-32 focus:border-[#0021A5] focus:outline-none transition-colors"
              autoFocus
            />
            <div className="flex justify-between mt-1">
              {answerText.trim().length < 50 && answerText.length > 0 && (
                <p className="text-xs text-amber-600">
                  A bit more detail would really help this student ({50 - answerText.trim().length} more characters)
                </p>
              )}
              <p className="text-xs text-slate-400 ml-auto">{answerText.length} characters</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAnswerInput(false);
                setAnswerText('');
              }}
              className="px-4 py-3 rounded-xl font-medium text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={answerText.trim().length < 50 || submitting}
              className={`
                flex-1 py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                ${answerText.trim().length >= 50 && !submitting
                  ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send My Answer
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Action Buttons */
        <div className="space-y-3">
          <button
            onClick={handleAnswerClick}
            className="w-full py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Answer This Question
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleReferral}
            className="w-full py-3 rounded-xl font-medium text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            I Know Someone Who Can Help
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Skip → Show Another
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← Back to previous step
      </button>

      {/* Referral Modal */}
      {showReferralModal && currentQuestion && (
        <ReferralModal
          question={currentQuestion}
          referrerName={user?.full_name}
          referrerEmail={user?.email}
          onClose={() => setShowReferralModal(false)}
          onSuccess={handleReferralSuccess}
        />
      )}
    </div>
  );
}