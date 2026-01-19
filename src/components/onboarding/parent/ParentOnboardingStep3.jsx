import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { JobRequest } from '@/entities/JobRequest';
import { Send, Users, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchingState from './SearchingState';
import StudentCard from './StudentCard';
import MatchContext, { getMatchTags, getMatchReason } from './MatchContext';
import AnswerSuccessState from './AnswerSuccessState';
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

// Scoring function
function scoreQuestion(question, parentIndustries, parentWaysToHelp) {
  let score = 0;
  
  const mappedHelpTypes = (question.help_types || [])
    .map(ht => HELP_TYPE_MAPPING[ht])
    .filter(Boolean);
  
  const helpOverlap = mappedHelpTypes.some(ht => parentWaysToHelp.includes(ht));
  if (helpOverlap) score += 50;
  
  const studentIndustries = question.target_industries?.length > 0 
    ? question.target_industries 
    : (question.target_industry ? [question.target_industry] : []);
  
  if (studentIndustries.length > 0) {
    const industryOverlap = studentIndustries.some(ind => parentIndustries.includes(ind));
    if (industryOverlap) score += 40;
  } else {
    score += 10;
  }
  
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
    const firstName = parts[1].split(' ')[0];
    return firstName || parts[1];
  }
  return posterName.split(' ')[0] || 'A student';
}

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
  const [flowType, setFlowType] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [answeredStudentName, setAnsweredStudentName] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [referralName, setReferralName] = useState('');

  const MAX_SKIPS_MATCHED = 4;
  const MAX_SKIPS_NO_MATCH = 2;
  const MAX_QUESTIONS = 5;

  const parentFirstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    loadMatchingQuestions();
  }, []);

  const loadMatchingQuestions = async () => {
    setLoading(true);
    setShowCard(false);
    const startTime = Date.now();
    
    try {
      const allQuestions = await JobRequest.filter(
        { status: 'active', poster_type: 'student', is_alumni_career_request: false },
        'created_date',
        200
      );

      if (allQuestions.length === 0) {
        setFlowType('empty');
        setNoQuestions(true);
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
        setLoading(false);
        return;
      }

      const parentIndustries = formData.industries || [];
      const parentWaysToHelp = formData.waysToHelp || [];

      const scoredQuestions = allQuestions
        .map(q => ({
          ...q,
          matchScore: scoreQuestion(q, parentIndustries, parentWaysToHelp)
        }))
        .sort((a, b) => {
          if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
          return new Date(a.created_date) - new Date(b.created_date);
        });

      const goodMatches = scoredQuestions.filter(q => q.matchScore >= 50);
      
      if (goodMatches.length > 0) {
        setFlowType('matched');
        setQuestions(goodMatches.slice(0, MAX_QUESTIONS));
      } else {
        const oldestUnanswered = allQuestions
          .filter(q => (q.answer_count || 0) === 0)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
          .slice(0, 3);
        
        if (oldestUnanswered.length > 0) {
          setFlowType('noMatch');
          setQuestions(oldestUnanswered.map(q => ({ ...q, matchScore: 0 })));
        } else if (scoredQuestions.length > 0) {
          setFlowType('noMatch');
          setQuestions(scoredQuestions.slice(0, 3));
        } else {
          setFlowType('empty');
          setNoQuestions(true);
        }
      }
      
      // Ensure minimum 2s loading time
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
      
    } catch (error) {
      console.error('Failed to load questions:', error);
      setFlowType('empty');
      setNoQuestions(true);
    } finally {
      setLoading(false);
      // Trigger card reveal animation
      setTimeout(() => setShowCard(true), 100);
    }
  };

  const currentQuestion = questions[currentIndex];
  const studentName = parseStudentName(currentQuestion?.poster_name);
  const isGoodMatch = flowType === 'matched';
  const totalQuestions = Math.min(MAX_QUESTIONS, questions.length);

  const handleSkip = () => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    setShowAnswerInput(false);
    setAnswerText('');
    setShowCard(false);

    const maxSkips = isGoodMatch ? MAX_SKIPS_MATCHED : MAX_SKIPS_NO_MATCH;

    if (newSkipCount >= maxSkips || currentIndex >= questions.length - 1) {
      onComplete({ skippedAll: true, flowType });
    } else {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setShowCard(true), 100);
    }
  };

  const handleAnswerClick = () => {
    setShowAnswerInput(true);
  };

  const handleSubmitAnswer = async () => {
    if (answerText.trim().length < 50) return;

    setSubmitting(true);
    try {
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

      await JobRequest.update(currentQuestion.id, {
        answer_count: (currentQuestion.answer_count || 0) + 1
      });

      setAnsweredStudentName(studentName);
      setShowSuccess(true);
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
      setShowCard(false);
      setTimeout(() => setShowCard(true), 100);
    }
  };

  const handleHelpAnother = () => {
    if (currentIndex < questions.length - 1) {
      setShowSuccess(false);
      setAnswerText('');
      setShowAnswerInput(false);
      setCurrentIndex(currentIndex + 1);
      setShowCard(false);
      setTimeout(() => setShowCard(true), 100);
    }
  };

  const handleDashboard = () => {
    onComplete({ 
      answeredQuestion: true, 
      questionId: currentQuestion?.id,
      studentName: answeredStudentName,
      flowType
    });
  };

  // Loading state
  if (loading) {
    return <SearchingState />;
  }

  // Success state after answering
  if (showSuccess) {
    return (
      <AnswerSuccessState
        studentName={answeredStudentName}
        onDashboard={handleDashboard}
        onHelpAnother={handleHelpAnother}
        hasMoreQuestions={currentIndex < questions.length - 1}
      />
    );
  }

  // No questions state
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

        <button
          onClick={() => onComplete({ noQuestions: true, flowType: 'empty' })}
          className="w-full py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
        >
          Go to My Dashboard →
        </button>
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

  // No current question fallback
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
        <button
          onClick={() => onComplete({ noQuestions: true, flowType: flowType || 'empty' })}
          className="w-full py-4 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
        >
          Go to My Dashboard →
        </button>
      </div>
    );
  }

  // Main question display
  const matchReason = getMatchReason(currentQuestion, formData.industries, formData.waysToHelp);
  const subheaderText = isGoodMatch 
    ? `Based on your ${matchReason}, you might be perfect for this.`
    : "This might not be your exact area, but maybe you can help—or know someone who can?";

  return (
    <div className="space-y-6">
      {/* Personalized header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
            {parentFirstName}, meet {studentName}.
          </h2>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <p className="text-slate-600">
          {subheaderText}
        </p>
      </div>

      {/* Humanized Student Card with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showCard ? 1 : 0, y: showCard ? 0 : 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <StudentCard 
          question={currentQuestion} 
          studentName={studentName}
          isVisible={showCard}
        />
      </motion.div>

      {/* Match context */}
      <MatchContext 
        question={currentQuestion}
        parentIndustries={formData.industries}
        parentWaysToHelp={formData.waysToHelp}
        showMatchTags={isGoodMatch}
      />

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
                  A bit more detail would really help ({50 - answerText.trim().length} more characters)
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
        <div className="space-y-3 mt-6">
          {/* Primary CTA */}
          <button
            onClick={handleAnswerClick}
            className="w-full py-4 bg-[#0021A5] hover:bg-[#001580] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Answer {studentName}'s Question
            <span>→</span>
          </button>

          {/* Secondary */}
          <button
            onClick={handleReferral}
            className="w-full py-3 border-2 border-slate-300 hover:border-[#0021A5] text-slate-700 font-medium rounded-xl transition-colors"
          >
            I Know Someone Who Can Help
          </button>

          {/* Tertiary */}
          <button
            onClick={handleSkip}
            className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {currentIndex >= questions.length - 1 ? "Skip for now" : "Show me another student"}
          </button>
        </div>
      )}

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