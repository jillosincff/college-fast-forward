import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

/* ── SVG Icons for industries (same as student onboarding) ── */
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

/* ── SVG Icons for ways to help ── */
const HelpIcons = {
  career_guidance: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6l-1.5 2.5L6 10l1.5-2.5L10 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  jobs_referrals: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7l-2 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  resume_interviews: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  industry_insights: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14V8l4-3 4 5 4-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  introductions: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5l3-3M4.5 8L3 9.5a2.12 2.12 0 003 3L7.5 11M8.5 5L10 3.5a2.12 2.12 0 013 3L11.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  grad_school: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4L2 7l6 3 6-3-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 8.5v3c0 1 1.3 2 3 2s3-1 3-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

const INDUSTRIES = [
  { id: 'tech', label: 'Tech' }, { id: 'finance', label: 'Finance' },
  { id: 'consulting', label: 'Consulting' }, { id: 'healthcare', label: 'Healthcare' },
  { id: 'marketing', label: 'Marketing' }, { id: 'engineering', label: 'Engineering' },
  { id: 'law', label: 'Law' }, { id: 'education', label: 'Education' },
  { id: 'real_estate', label: 'Real Estate' }, { id: 'nonprofit', label: 'Nonprofit' },
  { id: 'government', label: 'Government' }, { id: 'media', label: 'Media/Entertainment' },
  { id: 'startups', label: 'Startups' }, { id: 'other', label: 'Other' },
];

const WAYS_TO_HELP = [
  { id: 'career_guidance', label: 'Career guidance', desc: 'Help students figure out their path' },
  { id: 'jobs_referrals', label: 'Job referrals', desc: 'Share openings or refer candidates' },
  { id: 'resume_interviews', label: 'Resume & interview help', desc: 'Review resumes, do mock interviews' },
  { id: 'industry_insights', label: 'Industry insights', desc: "Share what your field is really like" },
  { id: 'introductions', label: 'Introductions', desc: 'Connect students to your network' },
  { id: 'grad_school', label: 'Grad school advice', desc: 'Help with grad school decisions' },
];

function IndustryCard({ id, label, selected, onToggle }) {
  const [tapped, setTapped] = useState(false);
  const Icon = IndustryIcons[id];
  return (
    <button type="button" data-chip="true" onClick={() => { setTapped(true); onToggle(id); setTimeout(() => setTapped(false), 150); }}
      style={{
        position: 'relative', background: selected ? 'rgba(232,93,32,0.08)' : '#fff',
        border: `0.5px solid ${selected ? 'rgba(232,93,32,0.4)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', transition: 'all 0.2s', transform: tapped ? 'scale(0.98)' : 'scale(1)',
        width: '100%', textAlign: 'left', minHeight: 'auto',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: selected ? 'rgba(232,93,32,0.12)' : 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? orange : '#888', transition: 'all 0.2s',
      }}>{Icon && <Icon />}</div>
      <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: selected ? 500 : 400, color: '#1a1a1a' }}>{label}</span>
      {selected && (
        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </button>
  );
}

function HelpCard({ id, label, desc, selected, onToggle }) {
  const Icon = HelpIcons[id];
  return (
    <button type="button" data-chip="true" onClick={() => onToggle(id)}
      style={{
        width: '100%', background: selected ? 'rgba(232,93,32,0.06)' : '#fff',
        border: `0.5px solid ${selected ? 'rgba(232,93,32,0.4)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', minHeight: 'auto',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: selected ? 'rgba(232,93,32,0.12)' : 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? orange : '#888',
      }}>{Icon && <Icon />}</div>
      <div>
        <span style={{ display: 'block', fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{label}</span>
        <span style={{ display: 'block', fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', marginTop: 2 }}>{desc}</span>
      </div>
    </button>
  );
}

export default function ParentOnboardingStep2({ formData, onUpdate, onNext, onBack }) {
  const toggleIndustry = (id) => {
    const current = formData.industries || [];
    if (current.includes(id)) onUpdate({ industries: current.filter(i => i !== id) });
    else if (current.length < 3) onUpdate({ industries: [...current, id] });
  };
  const toggleHelp = (id) => {
    const current = formData.waysToHelp || [];
    if (current.includes(id)) onUpdate({ waysToHelp: current.filter(i => i !== id) });
    else onUpdate({ waysToHelp: [...current, id] });
  };
  const canProceed = (formData.industries?.length >= 1) && (formData.waysToHelp?.length >= 1);

  return (
    <div style={{ animation: 'parentFadeUp 0.5s ease both' }}>
      <style>{`@keyframes parentFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@media(max-width:768px){.po2-grid{grid-template-columns:1fr !important}}`}</style>

      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#1a1a1a', marginBottom: 6 }}>What's your background?</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>This helps us match you with students who can benefit from your experience.</p>

      {/* Industries */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 10 }}>
          Your industry <span style={{ color: orange }}>*</span> <span style={{ fontWeight: 300, color: '#bbb' }}>(select 1–3)</span>
        </label>
        <div className="po2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {INDUSTRIES.map(ind => (
            <IndustryCard key={ind.id} id={ind.id} label={ind.label} selected={(formData.industries || []).includes(ind.id)} onToggle={toggleIndustry} />
          ))}
        </div>
        {(formData.industries || []).length === 0 && (
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: orange, marginTop: 8 }}>Please select at least one industry</p>
        )}
      </div>

      {/* Ways to help */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 10 }}>
          Ways you can help <span style={{ color: orange }}>*</span> <span style={{ fontWeight: 300, color: '#bbb' }}>(select at least 1)</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WAYS_TO_HELP.map(h => (
            <HelpCard key={h.id} id={h.id} label={h.label} desc={h.desc} selected={(formData.waysToHelp || []).includes(h.id)} onToggle={toggleHelp} />
          ))}
        </div>
        {(formData.waysToHelp || []).length === 0 && (
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: orange, marginTop: 8 }}>Please select at least one way you can help</p>
        )}
      </div>

      {/* Buttons */}
      <div className="po2-btns" style={{ display: 'flex', gap: 12 }}>
        <style>{`@media(max-width:768px){.po2-btns{flex-direction:column-reverse !important}.po2-btns button{width:100% !important}}`}</style>
        <button type="button" onClick={onBack} style={{
          background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
          color: '#888', fontFamily: dmSans, fontSize: 14, fontWeight: 400,
          borderRadius: 100, padding: '13px 24px', cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
        }}>← Back</button>
        <button type="button" onClick={onNext} disabled={!canProceed} style={{
          flex: 1, background: canProceed ? orange : 'rgba(0,0,0,0.06)',
          color: canProceed ? '#fff' : '#bbb',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          borderRadius: 100, padding: 13, border: 'none',
          cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 0.2s', minHeight: 'auto',
        }}
          onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = orangeHover; }}
          onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = orange; }}
        >Continue →</button>
      </div>
    </div>
  );
}