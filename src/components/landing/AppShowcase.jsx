import { useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";

const DOTS = ['#EF4444', '#F59E0B', '#10B981'];

const STEPS = [
  { label: 'Target & Path Locked', done: true },
  { label: 'Assets & Strategy Tailored', done: true },
  { label: 'Inside Tracks Isolated', done: false, active: true },
];

function DashboardMock() {
  return (
    <div style={{ fontFamily: FONT, background: '#0F172A', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes cliffPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {/* Browser chrome */}
      <div style={{ background: '#1E293B', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {DOTS.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#10B981' }}>🔒</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>app.collegefastforward.com/dashboard</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: '#0B1120', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>Good morning,<br />Marcus ⚡</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0, animation: 'cliffPulse 2s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>CliFF Agent: Active</span>
          </div>
          {['🎯 Dashboard', '📋 My Roadmap', '🔍 Inside Tracks', '✉️ Outreach'].map((item, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 7, background: i === 0 ? 'rgba(0,102,255,0.18)' : 'transparent', border: i === 0 ? '1px solid rgba(0,102,255,0.25)' : '1px solid transparent', fontSize: 11, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#93C5FD' : 'rgba(255,255,255,0.4)', cursor: 'default' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>

          {/* Header */}
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Your Sprint Roadmap</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>CliFF has isolated 2 hidden job tracks and aligned your verified campus insiders for today.</p>
          </div>

          {/* Stepper */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0,
                      background: step.done ? '#10B981' : step.active ? 'rgba(0,102,255,0.25)' : 'rgba(255,255,255,0.08)',
                      border: step.active ? '2px solid #3B82F6' : 'none',
                      boxShadow: step.active ? '0 0 8px rgba(59,130,246,0.5)' : 'none',
                      color: step.done ? '#fff' : step.active ? '#93C5FD' : 'rgba(255,255,255,0.3)',
                      fontWeight: 700,
                    }}>
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: step.active ? 700 : 500, color: step.done ? '#10B981' : step.active ? '#93C5FD' : 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: 72, lineHeight: 1.3 }}>{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: i === 0 ? '#10B981' : 'rgba(255,255,255,0.1)', margin: '0 4px', marginBottom: 18 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Card A */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, fontWeight: 800, color: '#fff' }}>S</div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#F1F5F9' }}>Stripe — Product Team Intern</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#818CF8', background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.25)', borderRadius: 4, padding: '2px 6px' }}>Unlisted Role</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#34D399', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 4, padding: '2px 6px' }}>Campus Connection Active</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '7px 9px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  <span style={{ color: '#FCD34D', fontWeight: 700 }}>Insider:</span> Mark R. (Wake Forest Parent) • Ready to push profile directly to team.
                </p>
              </div>
            </div>

            {/* Card B */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#F1F5F9' }}>Next Action Step Generated</p>
                <p style={{ margin: '0 0 10px', fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>CliFF has completely tailored your resume and drafted your target response sequence.</p>
              </div>
              <button style={{
                width: '100%', background: '#0066FF', border: 'none', borderRadius: 7,
                padding: '8px', fontSize: 10, fontWeight: 800, color: '#fff',
                cursor: 'default', letterSpacing: '0.02em',
                boxShadow: '0 4px 12px rgba(0,102,255,0.35)',
              }}>
                ⚡ Open Sprint Assets
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AppShowcase() {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      padding: '48px 24px 72px',
      background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)',
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Label */}
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#0066FF', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', textAlign: 'center' }}>
          Your Workspace
        </p>
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', textAlign: 'center', margin: '0 0 32px', lineHeight: 1.2 }}>
          Everything in one place — organized, automated, and ready.
        </h2>

        {/* Showcase frame */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            border: '1px solid rgba(0,102,255,0.12)',
            borderRadius: 20,
            overflow: 'hidden',
            background: 'rgba(15,23,42,0.04)',
            backdropFilter: 'blur(8px)',
            boxShadow: hovered
              ? '0 32px 72px -15px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,102,255,0.12)'
              : '0 20px 50px -15px rgba(0,0,0,0.15)',
            transform: hovered ? 'scale(1.01)' : 'scale(1)',
            transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <DashboardMock />
        </div>

        {/* Caption chips */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          {['📋 Pipeline Tracker', '⚡ AI Agent', '📄 Resume Tailoring', '✉️ Outreach Drafts'].map((label) => (
            <span key={label} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 100, padding: '5px 14px' }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}