import React, { useState, useEffect, useRef } from 'react';
import { mockInterviewAI } from '@/functions/mockInterviewAI';
import QuestionFeedback from './QuestionFeedback';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function TypewriterText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.substring(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <>{displayed}{!done && <span style={{ opacity: 0.5 }}>|</span>}</>;
}

function STARIndicator({ response }) {
  const lower = (response || '').toLowerCase();
  const checks = {
    S: /situation|context|background|when i was|at my|during/.test(lower),
    T: /task|responsible|goal|objective|needed to|assigned/.test(lower),
    A: /action|i (did|created|led|built|managed|organized|developed|implemented)/.test(lower),
    R: /result|outcome|increased|decreased|improved|achieved|led to|saved|grew/.test(lower),
  };
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      {Object.entries(checks).map(([key, detected]) => (
        <span key={key} style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          background: detected ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.06)',
          color: detected ? '#2e7d32' : 'rgba(244,240,232,0.25)',
          border: `0.5px solid ${detected ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 100, padding: '3px 10px', transition: 'all 0.3s',
        }}>
          {key}
        </span>
      ))}
    </div>
  );
}

export default function InterviewScreen({ session, onComplete, onEnd, userEmail }) {
  const [currentIdx, setCurrentIdx] = useState(session.current_question_index || 0);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [localSession, setLocalSession] = useState(session);
  const [showStarGuide, setShowStarGuide] = useState(false);
  const textareaRef = useRef(null);

  const questions = localSession.questions || [];
  const total = questions.length;
  const question = questions[currentIdx];
  const isBehavioral = question?.type === 'behavioral';
  const progress = total > 0 ? ((currentIdx) / total) * 100 : 0;

  const handleSubmit = async () => {
    if (response.trim().length < 50 || submitting) return;
    setSubmitting(true);
    try {
      const res = await mockInterviewAI({
        action: 'score',
        sessionId: localSession.id,
        questionIndex: currentIdx,
        studentResponse: response.trim(),
      });
      if (res.data?.success) {
        setCurrentFeedback(res.data.feedback);
        setCurrentScore(res.data.score);
        // Update local session
        const updated = { ...localSession };
        updated.questions = [...updated.questions];
        updated.questions[currentIdx] = {
          ...updated.questions[currentIdx],
          student_response: response.trim(),
          score: res.data.score,
          feedback: res.data.feedback,
        };
        setLocalSession(updated);
        setShowFeedback(true);
      }
    } catch (e) {
      console.error('Scoring failed:', e);
    }
    setSubmitting(false);
  };

  const handleSkip = () => {
    const updated = { ...localSession };
    updated.questions = [...updated.questions];
    updated.questions[currentIdx] = { ...updated.questions[currentIdx], skipped: true };
    setLocalSession(updated);
    goNext(updated);
  };

  const handleNext = () => {
    goNext(localSession);
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
    setResponse('');
  };

  const goNext = async (sess) => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= total) {
      // Complete the interview
      try {
        const res = await mockInterviewAI({ action: 'complete', sessionId: sess.id });
        if (res.data?.success) {
          const finalSession = {
            ...sess,
            status: 'complete',
            overall_score: res.data.overall_score,
            overall_feedback: res.data.overall_feedback,
            strengths_shown: res.data.strengths_shown,
            areas_to_improve: res.data.areas_to_improve,
          };
          onComplete(finalSession);
        } else {
          onComplete(sess);
        }
      } catch (e) {
        onComplete(sess);
      }
      return;
    }
    setCurrentIdx(nextIdx);
    setResponse('');
    setShowFeedback(false);
    setCurrentFeedback(null);
    setShowStarGuide(false);
  };

  // Feedback screen per question
  if (showFeedback && currentFeedback) {
    return (
      <QuestionFeedback
        question={question}
        score={currentScore}
        feedback={currentFeedback}
        isLast={currentIdx >= total - 1}
        onNext={handleNext}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d1117', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke={orange} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(244,240,232,0.5)' }}>Mock Interview</span>
        </div>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.4)' }}>
          Question {currentIdx + 1} of {total}
        </span>
        <button onClick={onEnd} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(244,240,232,0.3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e53935'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,240,232,0.3)'}>
          End interview
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: orange, width: `${progress}%`, transition: 'width 0.5s ease' }} />
      </div>

      {/* Question area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 32px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {/* Type badge */}
        <span style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: orange, marginBottom: 16,
        }}>
          {question?.type === 'behavioral' ? 'Behavioral · STAR Method' : question?.type?.charAt(0).toUpperCase() + question?.type?.slice(1)}
        </span>

        {/* FASTIQ Avatar + Question */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 8, width: '100%' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '0.5px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke={orange} strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 26px)', color: '#f4f0e8', lineHeight: 1.4, letterSpacing: '-0.01em', margin: 0 }}>
            <TypewriterText text={question?.question || ''} />
          </h2>
        </div>

        {/* STAR guide */}
        {isBehavioral && (
          <div style={{ width: '100%', marginBottom: 8 }}>
            <button onClick={() => setShowStarGuide(!showStarGuide)} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(244,240,232,0.3)',
              background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            }}>
              STAR Method guide {showStarGuide ? '▴' : '▾'}
            </button>
            {showStarGuide && (
              <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)', lineHeight: 1.7, marginTop: 8, paddingLeft: 16, borderLeft: '2px solid rgba(232,93,32,0.2)' }}>
                <p><strong style={{ color: orange }}>S</strong>ituation — Describe the context</p>
                <p><strong style={{ color: orange }}>T</strong>ask — What was your responsibility</p>
                <p><strong style={{ color: orange }}>A</strong>ction — What specifically did YOU do</p>
                <p><strong style={{ color: orange }}>R</strong>esult — What was the outcome (use numbers if possible)</p>
              </div>
            )}
          </div>
        )}

        {/* Thinking prompt */}
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)', marginTop: 16, marginBottom: 32 }}>
          Take a moment to think...
        </p>

        {/* Response textarea */}
        <div style={{ width: '100%', position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Type your answer here... Take your time."
            style={{
              width: '100%', minHeight: 160, maxHeight: 400, padding: '16px 18px',
              background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 14, fontFamily: dmSans, fontSize: 14, fontWeight: 300,
              color: '#f4f0e8', lineHeight: 1.7, outline: 'none', resize: 'vertical',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(232,93,32,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <span style={{ position: 'absolute', bottom: 8, right: 14, fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.2)' }}>
            {response.length}
          </span>
        </div>

        {/* STAR indicator for behavioral */}
        {isBehavioral && response.length > 20 && <STARIndicator response={response} />}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={response.trim().length < 50 || submitting} style={{
          width: '100%', padding: '13px 0', borderRadius: 100, border: 'none', marginTop: 20,
          background: response.trim().length >= 50 ? orange : 'rgba(255,255,255,0.06)',
          color: response.trim().length >= 50 ? '#fff' : 'rgba(255,255,255,0.25)',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: response.trim().length >= 50 ? 'pointer' : 'not-allowed', minHeight: 48,
        }}>
          {submitting ? 'Scoring your answer...' : 'Submit answer →'}
        </button>

        <button onClick={handleSkip} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.25)',
          background: 'none', border: 'none', cursor: 'pointer', marginTop: 12,
          textAlign: 'center', minHeight: 'auto', width: 'auto',
        }}>
          Skip this question →
        </button>
      </div>
    </div>
  );
}