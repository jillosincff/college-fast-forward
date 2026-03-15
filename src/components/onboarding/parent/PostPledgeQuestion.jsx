import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function PostPledgeQuestion({ user, formData, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      // Find unanswered questions matching parent's industry
      const parentIndustry = formData?.industries?.[0] || user?.industries?.[0] || user?.industry;
      
      let allQuestions = [];
      if (parentIndustry) {
        allQuestions = await base44.entities.JobRequest.filter(
          { status: 'active', poster_type: 'student' },
          '-created_date',
          20
        );
        // Prefer industry-matched, but show all if no matches
        const matched = (allQuestions || []).filter(q => 
          q.target_industry?.toLowerCase().includes(parentIndustry.toLowerCase()) &&
          (q.answer_count || 0) === 0
        );
        allQuestions = matched.length > 0 ? matched : (allQuestions || []).filter(q => (q.answer_count || 0) === 0);
      } else {
        allQuestions = await base44.entities.JobRequest.filter(
          { status: 'active', poster_type: 'student' },
          '-created_date',
          10
        );
        allQuestions = (allQuestions || []).filter(q => (q.answer_count || 0) === 0);
      }

      setQuestions(allQuestions.slice(0, 3));
      if (allQuestions.length > 0) {
        setSelectedQuestion(allQuestions[0]);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedQuestion) return;
    setAnswering(true);
    
    try {
      await base44.entities.Answer.create({
        question_id: selectedQuestion.id,
        question_type: 'JobRequest',
        answerer_user_id: user?.id,
        answerer_email: user?.email,
        answerer_name: user?.full_name || 'A College Fast Forward Parent',
        answerer_title: formData?.jobTitle || user?.current_position || user?.job_title || '',
        answerer_company: formData?.company || user?.current_company || user?.company || '',
        answerer_years_experience: formData?.yearsExperience || user?.years_experience || '',
        answerer_persona: 'parent',
        answer_text: answerText.trim(),
        is_lightweight_responder: false
      });

      // Update answer count on question
      await base44.entities.JobRequest.update(selectedQuestion.id, {
        answer_count: (selectedQuestion.answer_count || 0) + 1
      });

      // Mark first question shown
      await base44.auth.updateMe({ first_question_shown: true });

      setSubmitted(true);
      
      // Brief celebration then complete
      setTimeout(() => {
        onComplete({ answered: true, questionId: selectedQuestion.id });
      }, 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setAnswering(false);
    }
  };

  const handleSkip = async () => {
    // Mark that we showed the question but user skipped — no karma penalty
    try {
      await base44.auth.updateMe({ first_question_shown: true, skipped_pledge_question: true });
    } catch (e) {
      console.log('Failed to mark skip (non-critical):', e.message);
    }
    onComplete({ answered: false });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2">You just helped a student!</h1>
          <p className="text-white/80 text-lg">+15 karma earned. Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Finding a student who needs your help...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left - Motivation */}
      <div className="lg:w-[40%] bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#000F5C] text-white p-6 lg:p-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="text-4xl mb-4">💪</div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">
            Make your first impact!
          </h1>
          <p className="text-white/80 text-lg mb-6">
            A UF student posted a question that matches your background. Your answer could change their trajectory.
          </p>
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-white/90 text-sm">
              <strong className="text-[#FA4616]">+15 karma</strong> for answering — and your student gets a visibility boost immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Question + Answer */}
      <div className="lg:w-[60%] bg-white p-4 sm:p-6 lg:p-10 flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full">
          
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No questions right now</h2>
              <p className="text-slate-600 mb-8">Check back soon — students post questions daily!</p>
              <Button
                onClick={() => onComplete({ answered: false })}
                className="bg-[#0021A5] text-white px-8 py-3"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              {/* Question Card */}
              {selectedQuestion && (
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-3 font-medium">A student needs your help:</p>
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-[#0021A5] rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-[#0021A5] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-lg">
                          {selectedQuestion.title || selectedQuestion.description?.substring(0, 120)}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          — {selectedQuestion.poster_name || 'A UF Student'}
                          {selectedQuestion.student_major ? ` · ${selectedQuestion.student_major}` : ''}
                          {selectedQuestion.student_year ? ` '${selectedQuestion.student_year}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other questions to choose from */}
              {questions.length > 1 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Or answer a different question:</p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, i) => (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuestion(q)}
                        data-chip="true"
                        className={`chip-btn text-xs px-3 py-1.5 rounded-lg border transition ${
                          selectedQuestion?.id === q.id
                            ? 'border-[#0021A5] bg-blue-50 text-[#0021A5] font-semibold'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        Q{i + 1}: {(q.title || q.role || '').substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer textarea */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your answer:
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Share your advice, experience, or offer to connect them with someone in your network..."
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base resize-none h-36 focus:border-[#0021A5] focus:outline-none"
                  maxLength={2000}
                />
                <p className="text-xs text-slate-400 mt-1">{answerText.length}/2000</p>
              </div>

              {/* Two CTAs — Answer (primary) and Skip (secondary) */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || answering}
                  className="w-full h-14 text-lg font-bold"
                  style={{ backgroundColor: answerText.trim() ? '#FA4616' : undefined }}
                >
                  {answering ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Answer a Question Now
                      <span className="ml-2 text-white/80 text-sm font-normal">(+15 karma)</span>
                    </>
                  )}
                </Button>

                <button
                  onClick={handleSkip}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                >
                  Skip for now → Go to Dashboard
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                No penalty for skipping. You can answer questions anytime from your dashboard.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}