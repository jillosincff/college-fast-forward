import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import PostPledgeLeftPanel from './PostPledgeLeftPanel';
import { useToast } from '@/components/ui/use-toast';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

const truncate = (text, max = 30) =>
  text && text.length > max ? text.slice(0, max) + '...' : text || '';

/** Replace [field] placeholders with actual topic from the question */
function resolveFieldPlaceholder(text, question) {
  if (!text) return text;
  const field =
    question?.target_industry ||
    question?.industry ||
    question?.category ||
    question?.student_major ||
    'this field';
  return text.replace(/\[field\]/gi, field);
}

/** Build display name: "Jill O." */
function formatAttribution(q) {
  const name = q?.poster_name || q?.poster_first_name || q?.student_name || '';
  if (!name) return 'A Student';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  return parts[0];
}

export default function PostPledgeQuestion({ user, formData, onComplete }) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const selectedQuestion = questions[selectedIdx] || null;
  const canSubmit = answerText.trim().length >= 20;

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    try {
      const parentIndustries = formData?.industries || user?.industries || [];
      const primaryIndustry = parentIndustries[0] || user?.industry || '';

      let all = await base44.entities.JobRequest.filter(
        { status: 'active', poster_type: 'student' },
        '-created_date',
        30
      );
      all = (all || []).filter(q => (q.answer_count || 0) === 0);

      // Try industry-matched first
      let matched = [];
      if (primaryIndustry) {
        matched = all.filter(q => {
          const qi = (q.target_industry || q.industry || '').toLowerCase();
          return qi.includes(primaryIndustry.toLowerCase());
        });
      }
      if (matched.length === 0) matched = all;

      // Deduplicate by id
      const seen = new Set();
      const unique = matched.filter(q => {
        if (seen.has(q.id)) return false;
        seen.add(q.id);
        return true;
      }).slice(0, 3);

      setQuestions(unique);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!canSubmit || !selectedQuestion) return;
    setAnswering(true);

    try {
      // Create answer
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
        is_lightweight_responder: false,
      });

      // Update answer count
      await base44.entities.JobRequest.update(selectedQuestion.id, {
        answer_count: (selectedQuestion.answer_count || 0) + 1,
      });

      // Mark first question shown + award karma
      await base44.auth.updateMe({ first_question_shown: true });

      // Log activity
      try {
        await base44.entities.ActivityLog.create({
          student_email: user?.email,
          type: 'conversation_had',
          company_name: selectedQuestion.target_company || '',
          notes: `Answered student question during onboarding (+15 karma)`,
          fastiq_generated: false,
        });
      } catch {}

      // Award karma
      try {
        await base44.entities.KarmaTransaction.create({
          user_id: user?.id,
          user_email: user?.email,
          points: 15,
          reason: 'Answered a student question during onboarding',
          transaction_type: 'earned',
        });
      } catch {}

      setSubmitted(true);

      // Brief celebration then navigate
      setTimeout(() => {
        toast({ title: 'Answer posted! +15 karma earned 🎉', duration: 4000 });
        onComplete({ answered: true, questionId: selectedQuestion.id });
      }, 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setAnswering(false);
    }
  };

  const handleSkip = async () => {
    try {
      await base44.auth.updateMe({ first_question_shown: true, skipped_pledge_question: true });
    } catch {}
    onComplete({ answered: false });
  };

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#4ade80" strokeWidth="3" />
              <path d="M15 24l6 6 12-14" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#f4f0e8', marginBottom: 8 }}>
            You just helped a student!
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 300, color: 'rgba(244,240,232,0.7)' }}>
            +15 karma earned. Taking you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: orange, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.6)' }}>
            Finding a student who needs your help...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Main two-column layout ─── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes ppqFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ppq-pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.85; transform:scale(1.06) } }
        .ppq-field:focus { border-color: rgba(232,93,32,0.4) !important; outline: none; }
        .ppq-field::placeholder { color: rgba(0,0,0,0.25); }
        @media (max-width: 900px) {
          .ppq-layout { flex-direction: column !important; }
          .ppq-left { min-height: 280px !important; }
          .ppq-right { padding: 32px 24px !important; }
        }
      `}</style>

      {/* Left Panel */}
      <div className="ppq-left" style={{ width: '42%', minWidth: 320, flexShrink: 0 }}>
        <PostPledgeLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="ppq-right" style={{
        flex: 1, background: '#f4f2ee',
        padding: '48px 52px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 520, width: '100%', animation: 'ppqFadeUp 0.5s ease both' }}>
          {questions.length === 0 ? (
            /* ─── No questions fallback ─── */
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 8 }}>
                You're all set!
              </h2>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.7, marginBottom: 28 }}>
                Head to the dashboard and check back soon. Students are posting questions daily.
              </p>
              <button
                type="button"
                onClick={() => onComplete({ answered: false })}
                style={{
                  padding: '14px 32px', borderRadius: 100, border: 'none',
                  background: orange, color: '#fff',
                  fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = orange; }}
              >
                Go to Dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* Section label */}
              <p style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: '#aaa', marginBottom: 12,
              }}>
                A student needs your help:
              </p>

              {/* Question Card */}
              {selectedQuestion && (
                <div key={selectedQuestion.id} style={{
                  background: '#fff',
                  borderLeft: `3px solid ${orange}`,
                  borderRadius: '0 14px 14px 0',
                  padding: '18px 20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  marginBottom: 20,
                  animation: 'ppqFadeUp 0.4s ease both',
                }}>
                  <p style={{
                    fontFamily: playfair, fontWeight: 700, fontSize: 18,
                    color: '#1a1a1a', lineHeight: 1.4, marginBottom: 10,
                  }}>
                    {resolveFieldPlaceholder(
                      selectedQuestion.title || selectedQuestion.description?.substring(0, 200),
                      selectedQuestion
                    )}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa' }}>
                    — {formatAttribution(selectedQuestion)}
                    {selectedQuestion.student_major ? ` · ${selectedQuestion.student_major}` : ''}
                    {selectedQuestion.student_year ? ` '${selectedQuestion.student_year}` : ''}
                  </p>
                </div>
              )}

              {/* Question tabs */}
              {questions.length > 1 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginBottom: 10 }}>
                    Or answer a different question:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {questions.map((q, i) => {
                      const isActive = i === selectedIdx;
                      const label = truncate(
                        resolveFieldPlaceholder(q.title || q.role || q.description || '', q),
                        30
                      );
                      return (
                        <button
                          key={q.id}
                          type="button"
                          data-chip="true"
                          onClick={() => { setSelectedIdx(i); setAnswerText(''); }}
                          style={{
                            padding: '6px 14px', borderRadius: 100,
                            background: isActive ? orange : '#fff',
                            color: isActive ? '#fff' : '#888',
                            border: `0.5px solid ${isActive ? orange : 'rgba(0,0,0,0.1)'}`,
                            fontFamily: dmSans, fontSize: 12,
                            fontWeight: isActive ? 500 : 400,
                            cursor: 'pointer', transition: 'all 0.2s',
                            minHeight: 'auto', minWidth: 'auto',
                          }}
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = orange; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#888'; } }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Answer textarea */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                  color: '#888', marginBottom: 8,
                }}>
                  Your answer:
                </label>
                <textarea
                  className="ppq-field"
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value.slice(0, 2000))}
                  placeholder="Share your advice, experience, or offer to connect them with someone in your network..."
                  style={{
                    width: '100%', background: '#fff',
                    border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
                    padding: '14px 16px', fontFamily: dmSans, fontSize: 14, fontWeight: 300,
                    color: '#1a1a1a', lineHeight: 1.65, minHeight: 140, resize: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none',
                  }}
                />
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 6, textAlign: 'right' }}>
                  {answerText.length} / 2000
                </p>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!canSubmit || answering}
                style={{
                  width: '100%', padding: 14, borderRadius: 100, border: 'none',
                  background: canSubmit ? orange : 'rgba(0,0,0,0.06)',
                  color: canSubmit ? '#fff' : '#bbb',
                  fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', minHeight: 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: answering ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (canSubmit && !answering) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (canSubmit && !answering) e.currentTarget.style.background = orange; }}
              >
                {answering ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <>
                    Answer a Question Now
                    <span style={{
                      fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                      color: canSubmit ? 'rgba(255,255,255,0.8)' : '#bbb',
                      background: canSubmit ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderRadius: 100, padding: '2px 8px',
                    }}>
                      +15 karma
                    </span>
                    →
                  </>
                )}
              </button>

              {/* Skip link */}
              <button
                type="button"
                onClick={handleSkip}
                style={{
                  display: 'block', width: '100%', textAlign: 'center',
                  background: 'none', border: 'none', marginTop: 14,
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
                  cursor: 'pointer', transition: 'color 0.2s', minHeight: 'auto',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#888'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
              >
                Skip for now — Go to Dashboard
              </button>

              {/* Fine print */}
              <p style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb',
                textAlign: 'center', marginTop: 8,
              }}>
                No penalty for skipping. You can answer questions anytime from your dashboard.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}