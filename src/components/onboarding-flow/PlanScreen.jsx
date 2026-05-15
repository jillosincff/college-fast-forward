import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const GREEN = '#22c55e';
const BLUE = '#3b82f6';

const BLOCKER_LABELS = {
  resume: 'resume not getting responses',
  ghosted: 'being ghosted after applying',
  which_jobs: "not knowing which jobs to apply for",
  outreach: "not knowing how to reach the right people",
  disorganized: 'feeling disorganized',
  interviews: 'interview nerves',
};

function LockedCard({ icon, title, caption, children }) {
  return (
    <div style={{ background: '#1a1d24', border: '1px solid #2d3748', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #07080f 85%)', zIndex: 2, borderRadius: 20, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 3, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 16px', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: 13 }}>🔒</span>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Unlock to access</span>
        </div>
      </div>
      {/* Header */}
      <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</span>
        </div>
      </div>
      {/* Content (blurred) */}
      <div style={{ padding: '16px 20px 48px', filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
        {children}
      </div>
      {/* Caption */}
      <div style={{ position: 'relative', zIndex: 4, padding: '0 20px 18px', textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{caption}</p>
      </div>
    </div>
  );
}

function GhostJobRow({ title, company, risk, priority }) {
  const isHigh = risk > 50;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{title}</p>
        <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{company}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: isHigh ? '#f87171' : '#34d399', background: isHigh ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${isHigh ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`, borderRadius: 100, padding: '3px 10px' }}>
          {risk}% Ghost Risk
        </span>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: isHigh ? '#f87171' : '#34d399', margin: '4px 0 0' }}>{priority}</p>
      </div>
    </div>
  );
}

export default function PlanScreen({ resumeData, college, seeking, blockers = [], frustration, locationPref, locationCity, quickRole, onBack, saveAndAuth }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const name = resumeData?.original?.name?.split(' ')[0] || 'You';
  const location = locationPref === 'remote' ? 'Remote' : locationCity || resumeData?.original?.location?.split(',')[0] || 'your city';
  const targetRole = quickRole || (seeking === 'internship' ? 'internship' : seeking === 'fulltime' ? 'full-time role' : 'opportunity');
  const schoolName = college || 'your university';
  const isOverwhelmed = frustration >= 7;
  const mainBlocker = blockers[0] ? BLOCKER_LABELS[blockers[0]] : 'the application black hole';

  const empathyLine = isOverwhelmed
    ? `You've been ${mainBlocker} with ${frustration >= 9 ? 'no end in sight' : 'barely any traction'}. That ends today.`
    : `You've been working hard on ${mainBlocker}, but the market is flooded with ghost jobs and automated rejections. It's not your fault.`;

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 100, paddingBottom: 80, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes fadUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 10px rgba(34,197,94,0.0)} }
      `}</style>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
          {['Resume Wow', 'LinkedIn Identity', 'Your Plan'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i < 2 ? '#22c55e' : BLUE,
                  border: `2px solid ${i < 2 ? '#22c55e' : BLUE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: dm,
                  boxShadow: i === 2 ? '0 0 0 4px rgba(59,130,246,0.25), 0 0 20px rgba(59,130,246,0.5)' : 'none',
                  animation: i === 2 ? 'pulseGreen 2s ease-in-out infinite' : 'none',
                }}>
                  {i < 2 ? '✓' : '3'}
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, color: i === 2 ? '#93c5fd' : '#86efac', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: '#22c55e', borderRadius: 2, marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
          <span style={{ fontSize: 13 }}>🗺️</span>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Step 3 — Your 14-Day Action Plan</span>
        </div>
      </div>

      {/* ── Section 1: Empathy Hook ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(15,15,25,0.8) 100%)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 24, padding: '32px 28px', marginBottom: 24 }}>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          {name}, we know the{' '}
          <span style={{ color: '#f87171' }}>"Black Hole"</span>{' '}
          is exhausting.
        </h1>
        <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 16px' }}>
          {empathyLine} You've been applying to <strong style={{ color: '#fff' }}>{targetRole} roles in {location}</strong>, but it feels like your resume is vanishing into thin air.
        </p>
        <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0 }}>
          We've already fixed your <strong style={{ color: '#34d399' }}>Resume</strong> and rebuilt your <strong style={{ color: '#60a5fa' }}>LinkedIn</strong> — that's the armor. Now it's time for the <strong style={{ color: '#fff' }}>Strategy.</strong> We've built your 14-day roadmap to bypass the bots and get you in front of the people who actually hire.
        </p>
      </div>

      {/* ── Section 2: Vested Timeline ── */}
      <div style={{ background: '#1a1d24', border: '1px solid #2d3748', borderRadius: 24, padding: '28px 28px', marginBottom: 24 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 22px' }}>✓ Here's What We've Already Done</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { icon: '📄', color: '#34d399', borderColor: '#10b981', label: 'RESUME OPTIMIZED', desc: 'Your 51/100 draft is now a 97/100 Recruiter-Ready asset.' },
            { icon: '💼', color: '#60a5fa', borderColor: '#3b82f6', label: 'LINKEDIN REBUILT', desc: 'Your digital identity is synced and keyword-optimized.' },
            { icon: '🗺️', color: '#a78bfa', borderColor: '#7c3aed', label: 'PLAN GENERATED', desc: `We've mapped out your next 14 days in ${location}.` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', paddingBottom: i < 2 ? 24 : 0 }}>
              {/* Vertical line */}
              {i < 2 && <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'rgba(255,255,255,0.07)' }} />}
              {/* Circle */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${item.borderColor}`, background: `rgba(${item.borderColor === '#10b981' ? '16,185,129' : item.borderColor === '#3b82f6' ? '59,130,246' : '124,58,237'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>✓</span> {item.label}
                </p>
                <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Locked Preview Cards ── */}
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>What You're Unlocking</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

        {/* Card A: Ghost Radar */}
        <LockedCard icon="👻" title="Ghost-Radar Application Feed" caption="Stop wasting hours on dead-end leads. We tell you which jobs are real and which are ghosts.">
          <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 12px' }}>Live {targetRole} roles in {location}:</p>
          <GhostJobRow title="Marketing Coordinator" company="Sunshine Media · Miami, FL" risk={82} priority="⚠️ Skip" />
          <GhostJobRow title="Brand Associate" company="Nova Agency · Miami, FL" risk={12} priority="✅ High Priority" />
          <GhostJobRow title="Growth Marketing Intern" company="Futura Co · Remote" risk={9} priority="✅ High Priority" />
        </LockedCard>

        {/* Card B: Alumni Outreach */}
        <LockedCard icon="🤝" title="Alumni Outreach Command" caption={`No more cold DMs. We find your ${schoolName} insiders and write the messages that actually get replies.`}>
          <div style={{ background: 'rgba(0,119,181,0.08)', border: '1px solid rgba(0,119,181,0.2)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,119,181,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
              <div>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Sarah K. · {schoolName} Alum</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Senior Marketing Manager · Top Miami Agency</p>
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '2px 8px', flexShrink: 0 }}>WARM</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"Hi Sarah — fellow {schoolName} alum here! I noticed you're at [Agency] and I'd love to hear about the team culture. I'm targeting marketing roles in Miami — any chance you have 5 minutes?"</p>
            </div>
          </div>
        </LockedCard>

        {/* Card C: Hiring CRM */}
        <LockedCard icon="📊" title="Your Personal Hiring CRM" caption="Your personal career agent tracks everything. You just show up to the interviews.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[{ n: '7', label: 'Jobs Applied', color: '#60a5fa' }, { n: '2', label: 'Interviews Scheduled', color: '#34d399' }, { n: '3', label: 'Follow-ups Due Today', color: '#f97316' }].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ fontFamily: sat, fontSize: 24, fontWeight: 900, color: s.color, margin: '0 0 4px' }}>{s.n}</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#f97316', margin: '0 0 4px' }}>⏰ Today's Priority</p>
            <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Follow up with Nova Agency application (Day 5)</p>
          </div>
        </LockedCard>
      </div>

      {/* ── Section 4: Final CTA ── */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(15,15,25,0.8) 100%)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 24, padding: '36px 28px', marginBottom: 20 }}>
        <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
          You don't have to do this alone anymore.
        </p>
        <h2 style={{ fontFamily: sat, fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 900, color: '#fff', margin: '0 0 28px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Let's get you hired. 🎯
        </h2>

        <button
          onClick={() => setShowPaywall(true)}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 12px',
            fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none', borderRadius: 18, padding: '22px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.3)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(34,197,94,0.6), 0 2px 8px rgba(0,0,0,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.3)'; }}
        >
          Unlock My 14-Day Action Plan — $4.99/wk →
        </button>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 16px' }}>
          🎁 Invite a friend and your first week is on us.
        </p>
        <button
          onClick={saveAndAuth}
          style={{ fontFamily: dm, fontSize: 13, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
        >
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div
          onClick={() => setShowPaywall(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', animation: 'fadUp 0.25s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>🗺️</div>
            <h2 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your 14-Day Plan</h2>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#9ca3af', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>Ghost Radar feed, Alumni Outreach Command, Personal Hiring CRM, and unlimited AI coaching.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: '#374151', border: '1px solid #4b5563', borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={e => e.currentTarget.style.background = '#374151'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>$4.99 / week</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>Cancel anytime</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: '#34d399', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '3px 10px' }}>Most flexible</span>
              </button>

              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: 'linear-gradient(135deg, #059669, #047857)', border: '2px solid #34d399', borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#d1fae5', margin: '3px 0 0' }}>Best value · Most students choose this</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#000', background: '#fff', borderRadius: 100, padding: '4px 10px', position: 'absolute', top: -10, right: 12 }}>POPULAR</span>
              </button>
            </div>

            <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '16px 0 0' }}>🎁 Invite a friend — get your first week free</p>

            <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 20 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}