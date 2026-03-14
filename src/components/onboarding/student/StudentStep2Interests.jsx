import React, { useState, useEffect } from 'react';
import StudentStep1ProgressBar from './StudentStep1ProgressBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

/* ─── SVG ICONS (stroke-based 16×16) ─── */
const IndustryIcons = {
  tech: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5 14h6M8 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  finance: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 11l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  consulting: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  healthcare: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  marketing: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7h2l7-4v10L5 9H3a1 1 0 01-1-1v0a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  engineering: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  law: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 6l-3 4h6L5 6zM11 6l-3 4h6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  education: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4L2 7l6 3 6-3-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 8.5v3c0 1 1.3 2 3 2s3-1 3-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  real_estate: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l6-5 6 5v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  nonprofit: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13s-6-4-6-7.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0C16 9 8 13 8 13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  government: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="12" width="12" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 2L2 6h12L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="4" y="6" width="2" height="6" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="6" width="2" height="6" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="6" width="2" height="6" stroke="currentColor" strokeWidth="1.5"/></svg>,
  media: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 5.5l5 2.5-5 2.5V5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  startups: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2c2 0 5 2 5 6 0 2-1 3-2 4l-1 3H6l-1-3C4 11 3 10 3 8c0-4 3-6 5-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  other: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="5" r="1" fill="currentColor"/><circle cx="8" cy="5" r="1" fill="currentColor"/><circle cx="11" cy="5" r="1" fill="currentColor"/><circle cx="5" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="11" cy="8" r="1" fill="currentColor"/><circle cx="5" cy="11" r="1" fill="currentColor"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="11" r="1" fill="currentColor"/></svg>,
};

const SeekingIcons = {
  fulltime: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  internship: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M3 6h10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9l-1.5 1.5M8 9V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  coop: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 5l2 3-2 3M5 11L3 8l2-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3l-2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  parttime: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gradschool: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4L2 7l6 3 6-3-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 8.5v3c0 1 1.3 2 3 2s3-1 3-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  exploring: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6l-1.5 2.5L6 10l1.5-2.5L10 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
};

const INDUSTRIES = [
  { id: 'tech', label: 'Tech' },
  { id: 'finance', label: 'Finance' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'law', label: 'Law' },
  { id: 'education', label: 'Education' },
  { id: 'real_estate', label: 'Real Estate' },
  { id: 'nonprofit', label: 'Nonprofit' },
  { id: 'government', label: 'Government' },
  { id: 'media', label: 'Media/Entertainment' },
  { id: 'startups', label: 'Startups' },
  { id: 'other', label: 'Other' },
];

const SEEKING = [
  { id: 'fulltime', label: 'Full-time job' },
  { id: 'internship', label: 'Internship' },
  { id: 'coop', label: 'Co-op' },
  { id: 'parttime', label: 'Part-time' },
  { id: 'gradschool', label: 'Grad school advice' },
  { id: 'exploring', label: 'Just exploring' },
];

/* ─── Selectable Card ─── */
function SelectCard({ id, label, selected, onToggle, iconMap, subtitle }) {
  const [tapped, setTapped] = useState(false);
  const Icon = iconMap[id];

  const handleClick = () => {
    setTapped(true);
    onToggle(id);
    setTimeout(() => setTapped(false), 150);
  };

  return (
    <button
      type="button"
      data-chip="true"
      onClick={handleClick}
      style={{
        position: 'relative',
        background: selected ? 'rgba(232,93,32,0.08)' : '#fff',
        border: `0.5px solid ${selected ? 'rgba(232,93,32,0.4)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: tapped ? 'scale(0.98)' : 'scale(1)',
        width: '100%', textAlign: 'left',
        minHeight: 'auto',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.02)'; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = '#fff'; } }}
    >
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: selected ? 'rgba(232,93,32,0.12)' : 'rgba(0,0,0,0.04)',
        border: `0.5px solid ${selected ? 'rgba(232,93,32,0.2)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? orange : '#888',
        transition: 'all 0.2s ease',
      }}>
        {Icon && <Icon />}
      </div>

      {/* Label */}
      <div>
        <span style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: selected ? 500 : 400,
          color: '#1a1a1a', transition: 'font-weight 0.2s ease',
        }}>
          {label}
        </span>
        {subtitle && (
          <span style={{
            display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 300,
            color: '#aaa', fontStyle: 'italic', marginTop: 2,
          }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 18, height: 18, borderRadius: '50%', background: orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'step2CheckFadeIn 0.15s ease',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  );
}

/* ─── Main Component ─── */
export default function StudentStep2Interests({
  industries, onIndustriesChange,
  seeking, onSeekingChange,
  onNext, onBack,
  isValid,
}) {
  const toggleIndustry = (id) => {
    onIndustriesChange(
      industries.includes(id) ? industries.filter(x => x !== id) : [...industries, id]
    );
  };
  const toggleSeeking = (id) => {
    onSeekingChange(
      seeking.includes(id) ? seeking.filter(x => x !== id) : [...seeking, id]
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f2ee' }}>
      {/* Inline animation keyframes */}
      <style>{`
        @keyframes step2FadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes step2CheckFadeIn { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }
      `}</style>

      <StudentStep1ProgressBar currentStep={2} />

      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', width: '100%', padding: '48px 24px 80px' }} className="step2-container">
        <style>{`@media(max-width:768px){.step2-container{padding:32px 20px 60px !important}}`}</style>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'step2FadeUp 0.4s ease both' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: 12 }}>
            Step 2 of 3
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 8 }}>
            <span style={{ fontFamily: dmSans, fontWeight: 600, color: '#1a1a1a' }}>What kind of work </span>
            <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>interests you?</span>
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6, marginBottom: 6 }}>
            We'll match you with UF parents and alumni who work in these fields.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#bbb', fontStyle: 'italic' }}>
            Select all that apply
          </p>
        </div>

        {/* Industries */}
        <div style={{ marginBottom: 40, animation: 'step2FadeUp 0.4s 0.08s ease both' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 14 }}>
            Industries
          </p>
          <div className="step2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <style>{`@media(max-width:768px){.step2-grid{grid-template-columns:1fr !important}}`}</style>
            {INDUSTRIES.map(item => (
              <SelectCard
                key={item.id}
                id={item.id}
                label={item.label}
                selected={industries.includes(item.id)}
                onToggle={toggleIndustry}
                iconMap={IndustryIcons}
              />
            ))}
          </div>
        </div>

        {/* Looking for */}
        <div style={{ marginBottom: 36, animation: 'step2FadeUp 0.4s 0.14s ease both' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: 14 }}>
            What are you looking for?
          </p>
          <div className="step2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {SEEKING.map(item => (
              <SelectCard
                key={item.id}
                id={item.id}
                label={item.label}
                selected={seeking.includes(item.id)}
                onToggle={toggleSeeking}
                iconMap={SeekingIcons}
                subtitle={item.id === 'exploring' ? "That's okay — you'll still get matched." : undefined}
              />
            ))}
          </div>
        </div>

        {/* Selection counter */}
        {(industries.length > 0 || seeking.length > 0) && (
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>
            {industries.length} {industries.length === 1 ? 'industry' : 'industries'} selected · {seeking.length} {seeking.length === 1 ? 'goal' : 'goals'} selected
          </p>
        )}

        {/* Button row */}
        <div className="step2-buttons" style={{ display: 'flex', gap: 12, marginTop: 8, animation: 'step2FadeUp 0.4s 0.2s ease both' }}>
          <style>{`@media(max-width:768px){.step2-buttons{flex-direction:column-reverse !important}.step2-buttons button{width:100% !important}}`}</style>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
              color: '#888', fontFamily: dmSans, fontSize: 14, fontWeight: 400,
              borderRadius: 100, padding: '13px 24px', cursor: 'pointer',
              transition: 'all 0.2s ease', minHeight: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#555'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#888'; }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid}
            style={{
              flex: 1,
              background: isValid ? orange : 'rgba(0,0,0,0.06)',
              color: isValid ? '#fff' : '#bbb',
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              borderRadius: 100, padding: 13, border: 'none',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease', minHeight: 'auto',
            }}
            onMouseEnter={e => { if (isValid) e.currentTarget.style.background = orangeHover; }}
            onMouseLeave={e => { if (isValid) e.currentTarget.style.background = orange; }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}