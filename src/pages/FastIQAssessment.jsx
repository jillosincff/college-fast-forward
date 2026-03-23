import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ArchetypeCard from '@/components/fastiq/ArchetypeCard';
import { QUESTIONS, ASSESSMENT_SYSTEM_PROMPT, ASSESSMENT_RESPONSE_SCHEMA } from '@/components/fastiq/assessmentQuestions';
import { useAuth } from '@/components/auth/AuthContext';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function isFastIQUser(user) {
  return !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
}

function hasCompletedAssessment(user) {
  return !!(user?.career_goals?.archetype);
}

// ─── Loading reveal ───────────────────────────────────────────────────────────

function RevealLoader() {
  const [step, setStep] = useState(0);
  const steps = ["Analyzing your responses...", "Mapping your profile...", "Your Career Archetype is ready."];
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, animation: 'orbPulse 1.5s ease-in-out infinite' }}>
        ⚡
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0, transition: 'opacity 0.4s', opacity: step >= 0 ? 1 : 0 }}>
        {steps[step]}
      </p>
    </div>
  );
}

// ─── Gate for free users ──────────────────────────────────────────────────────

function UpgradeGate({ onNavigate }) {
  return (
    <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: 36, boxShadow: '0 0 40px rgba(232,93,32,0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E85D20', marginBottom: 8 }}>
          FASTIQ CAREER ASSESSMENT
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 }}>
          Discover Your Career Archetype
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>
          A scientifically-backed profile that powers your entire CFF experience.
        </p>
        <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
          {[
            '10-minute conversational assessment',
            'Validated career archetype with role matches',
            'Permanent profile that personalizes everything',
            'See which CFF parents share your archetype',
            'Included with FastIQ',
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#E85D20', fontWeight: 700 }}>✓</span> {item}
            </p>
          ))}
        </div>
        <button
          onClick={() => onNavigate?.('upgrade')}
          style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12, minHeight: 'auto' }}>
          Unlock FastIQ — $29/month →
        </button>
        <button
          onClick={() => onNavigate?.('founding')}
          style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 100, padding: '13px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          See founding member rate →
        </button>
      </div>
    </div>
  );
}

// ─── Main assessment ──────────────────────────────────────────────────────────

export default function FastIQAssessment({ onTabChange }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState('intro'); // intro | questions | revealing | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]); // [{question, answer}]
  const [lastAck, setLastAck] = useState('');
  const [loadingAck, setLoadingAck] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const bottomRef = useRef(null);

  const isPaidUser = isFastIQUser(user);
  const alreadyDone = hasCompletedAssessment(user);

  useEffect(() => {
    if (alreadyDone && phase === 'intro') setPhase('result_existing');
  }, [alreadyDone, phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase, currentQ, lastAck]);

  const handleAnswer = async (answer) => {
    const q = QUESTIONS[currentQ];
    const newAnswers = [...answers, { question: q.text, answer }];
    setAnswers(newAnswers);
    setLoadingAck(true);

    const isLast = currentQ === QUESTIONS.length - 1;

    if (isLast) {
      // Synthesize
      setPhase('revealing');
      try {
        const answerText = newAnswers.map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`).join('\n\n');
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `${ASSESSMENT_SYSTEM_PROMPT}\n\nStudent's 18 answers:\n\n${answerText}`,
          response_json_schema: ASSESSMENT_RESPONSE_SCHEMA,
        });
        setResult(res);
        // Save to profile
        if (res?.goals_summary_update) {
          const existing = user?.career_goals || {};
          base44.auth.updateMe({
            career_goals: {
              ...existing,
              ...res.goals_summary_update,
              archetype: res.archetype_name,
              assessment_completed_at: new Date().toISOString(),
            },
          }).catch(console.error);
        }
        setPhase('result');
      } catch (e) {
        console.error('Assessment synthesis failed:', e);
        setError(true);
        setPhase('questions'); // back so they can retry
      }
      setLoadingAck(false);
      return;
    }

    // Get a brief acknowledgment from FastIQ before next question
    try {
      const ackRes = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FastIQ, a career AI. A student just answered a career assessment question. Give a 1-sentence warm acknowledgment of their answer — be specific, not generic. Then stop (no next question). Keep it under 15 words.\n\nQuestion: ${q.text}\nAnswer: ${answer}`,
      });
      setLastAck(typeof ackRes === 'string' ? ackRes : (ackRes?.message || ackRes?.response_text || ''));
    } catch {
      setLastAck('');
    }

    setLoadingAck(false);
    setCurrentQ(prev => prev + 1);
  };

  const handleRetake = () => {
    setPhase('intro');
    setAnswers([]);
    setCurrentQ(0);
    setLastAck('');
    setResult(null);
    setError(false);
  };

  // ── Existing result view ──
  if (phase === 'result_existing') {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh', padding: '32px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E85D20', marginBottom: 16 }}>
            YOUR CAREER ARCHETYPE
          </p>
          {/* Show saved archetype info */}
          <div style={{ background: '#111', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#E85D20', margin: '0 0 8px' }}>
              {user?.career_goals?.archetype || 'Your Archetype'}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
              {user?.career_goals?.career_profile_summary || ''}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onTabChange?.('company_intel')}
                style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
                Explore Companies →
              </button>
              <button onClick={() => onTabChange?.('career_path')}
                style={{ background: 'none', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
                Career Paths →
              </button>
              <button onClick={handleRetake}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '10px 4px' }}>
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Gate ──
  if (!isPaidUser) {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh' }}>
        <UpgradeGate onNavigate={(dest) => onTabChange?.(dest)} />
      </div>
    );
  }

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚡</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E85D20', marginBottom: 10 }}>
            FASTIQ CAREER ASSESSMENT
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 }}>
            Ready to find your Career Archetype?
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 36, lineHeight: 1.6 }}>
            I'll ask you 18 quick questions — be honest, not impressive. Your answers power everything on this platform.
          </p>
          <button onClick={() => setPhase('questions')}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', minHeight: 'auto' }}>
            Start Assessment →
          </button>
        </div>
      </div>
    );
  }

  // ── Revealing ──
  if (phase === 'revealing') {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh' }}>
        <RevealLoader />
        <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.2);opacity:1} }`}</style>
      </div>
    );
  }

  // ── Result ──
  if (phase === 'result' && result) {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh', padding: '32px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <ArchetypeCard result={result} onTabChange={onTabChange} onRetake={handleRetake} />
        </div>
        <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.2);opacity:1} }`}</style>
      </div>
    );
  }

  // ── Questions ──
  const q = QUESTIONS[currentQ];
  const progress = Math.round(((currentQ) / QUESTIONS.length) * 100);

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#E85D20', transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 100px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
        {/* Section label */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 24, marginTop: 12 }}>
          {q.section} · {currentQ + 1} of {QUESTIONS.length}
        </p>

        {/* Previous ack */}
        {lastAck && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚡</div>
            <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              {lastAck}
            </div>
          </div>
        )}

        {/* Current question */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚡</div>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#fff', lineHeight: 1.5 }}>
            {q.text}
          </div>
        </div>

        {/* Chips */}
        {!loadingAck && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 40 }}>
            {q.chips.map((chip, i) => (
              <button key={i} onClick={() => handleAnswer(chip)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 18px', fontSize: 14, color: 'rgba(255,255,255,0.85)', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto', transition: 'background 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.1)'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {loadingAck && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 40, marginTop: 12 }}>
            <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px', padding: '10px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', display: 'inline-block', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>Something went wrong generating your result.</p>
            <button onClick={() => { setError(false); handleAnswer(answers[answers.length - 1]?.answer); }}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
              Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
      `}</style>
    </div>
  );
}