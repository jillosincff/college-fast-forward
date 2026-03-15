import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const TYPES = [
  { key: 'behavioral', icon: '👥', label: 'Behavioral', desc: '"Tell me about a time..." questions using the STAR method', color: orange },
  { key: 'technical', icon: '💻', label: 'Technical', desc: 'Problem-solving, logic, and domain knowledge questions', color: '#2196F3' },
  { key: 'case', icon: '📊', label: 'Case', desc: 'Business problem analysis — common in consulting and strategy', color: '#9C27B0' },
  { key: 'mixed', icon: '⚡', label: 'Mixed', desc: 'A realistic mix of all types — best for general prep', color: orange },
];

const DIFFICULTIES = [
  { key: 'entry', label: 'Entry Level' },
  { key: 'mid', label: 'Mid Level' },
  { key: 'senior', label: 'Senior' },
];

const Q_COUNTS = [3, 5, 10];

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
      color: active ? '#fff' : '#888',
      background: active ? orange : '#fff',
      border: `0.5px solid ${active ? orange : 'rgba(0,0,0,0.1)'}`,
      borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
      transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
    }}>{label}</button>
  );
}

export default function InterviewSetup({ onStart, onViewHistory, error, prefillCompany, prefillType }) {
  const [type, setType] = useState(prefillType || '');
  const [company, setCompany] = useState(prefillCompany || '');
  const [jobTitle, setJobTitle] = useState('');
  const [difficulty, setDifficulty] = useState('entry');
  const [questionCount, setQuestionCount] = useState(5);

  const canStart = !!type;

  const handleStart = () => {
    if (!canStart) return;
    onStart({ interviewType: type, difficulty, companyName: company, jobTitle, questionCount });
  };

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
          Mock <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>Interview</em>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginTop: 4, marginBottom: 28 }}>
          Practice with FASTIQ as your interviewer. Get scored, get feedback, get ready.
        </p>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '28px 32px' }}>
          {/* Interview Type */}
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 10 }}>
            What kind of interview are you preparing for?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }} className="mi-type-grid">
            <style>{`@media(max-width:500px){.mi-type-grid{grid-template-columns:1fr!important}}`}</style>
            {TYPES.map(t => (
              <div
                key={t.key}
                onClick={() => setType(t.key)}
                style={{
                  background: type === t.key ? 'rgba(232,93,32,0.06)' : 'rgba(0,0,0,0.02)',
                  border: `0.5px solid ${type === t.key ? 'rgba(232,93,32,0.4)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginTop: 8, marginBottom: 3 }}>{t.label}</p>
                <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', lineHeight: 1.4, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Company */}
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>
            Preparing for a specific company?
          </label>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginBottom: 8 }}>
            FASTIQ will use real questions from that company's interviews.
          </p>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Google, McKinsey, Nike (optional)"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: dmSans, fontSize: 14, outline: 'none', marginBottom: 6 }}
          />
          <input
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="Job title (optional)"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: dmSans, fontSize: 14, outline: 'none', marginBottom: 20 }}
          />

          {/* Difficulty */}
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 8 }}>
            Experience level to simulate:
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {DIFFICULTIES.map(d => <Pill key={d.key} label={d.label} active={difficulty === d.key} onClick={() => setDifficulty(d.key)} />)}
          </div>

          {/* Question Count */}
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 8 }}>
            How many questions?
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {Q_COUNTS.map(n => <Pill key={n} label={`${n} questions`} active={questionCount === n} onClick={() => setQuestionCount(n)} />)}
          </div>

          {/* Start */}
          <button onClick={handleStart} disabled={!canStart} style={{
            width: '100%', padding: '14px 0', borderRadius: 100, border: 'none',
            background: canStart ? orange : 'rgba(0,0,0,0.06)',
            color: canStart ? '#fff' : 'rgba(0,0,0,0.3)',
            fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: canStart ? 'pointer' : 'not-allowed', minHeight: 48, transition: 'all 0.2s',
          }}>
            Start Interview →
          </button>
        </div>

        {/* Quick start links */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => { setType('behavioral'); setQuestionCount(1); setTimeout(handleStart, 0); }}
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(232,93,32,0.7)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto', display: 'block', margin: '8px auto' }}>
            Practice 1 random behavioral question →
          </button>
          <button onClick={onViewHistory}
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}>
            View past interviews →
          </button>
        </div>
      </div>
    </div>
  );
}