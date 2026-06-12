import { useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";

const DOTS = ['#EF4444', '#F59E0B', '#10B981'];

const PIPELINE = [
  { label: 'Opportunities', count: 6, color: '#6D28D9' },
  { label: 'Reached Out', count: 3, color: '#0891B2' },
  { label: 'Interviews', count: 1, color: '#16A34A' },
];

function DashboardMock() {
  return (
    <div style={{ fontFamily: FONT, background: '#F8FAFC', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes cliffPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {/* Browser chrome */}
      <div style={{ background: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {DOTS.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 6, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#10B981' }}>🔒</span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>app.collegefastforward.com/dashboard</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Good morning,<br />Marcus ⚡</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0, animation: 'cliffPulse 2s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>CliFF Agent: Active</span>
          </div>
          {['🎯 Dashboard', '📋 My Pipeline', '🤝 Alumni Network', '📄 Resume'].map((item, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 7, background: i === 0 ? 'rgba(109,40,217,0.08)' : 'transparent', border: i === 0 ? '1px solid rgba(109,40,217,0.20)' : '1px solid transparent', fontSize: 11, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#6D28D9' : '#94A3B8', cursor: 'default' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>

          {/* Header */}
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Today's Matches</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: '#94A3B8', lineHeight: 1.5 }}>5 new roles matched to your goals — 2 have warm connections from your school.</p>
          </div>

          {/* Pipeline strip */}
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
            {PIPELINE.map((stage, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < PIPELINE.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: stage.color, letterSpacing: '-0.02em' }}>{stage.count}</p>
                <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 600, color: '#94A3B8' }}>{stage.label}</p>
              </div>
            ))}
          </div>

          {/* Match cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Card A — job match with alumni connection */}
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px', border: '1px solid rgba(109,40,217,0.20)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, fontWeight: 800, color: '#fff' }}>D</div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Deloitte — Summer Analyst Intern</p>
              </div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#16A34A', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 4, padding: '2px 6px' }}>Posted 2 days ago</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#6D28D9', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 4, padding: '2px 6px' }}>🤝 3 alumni work here</span>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 6, padding: '7px 9px', border: '1px solid #F1F5F9' }}>
                <p style={{ margin: 0, fontSize: 9, color: '#64748B', lineHeight: 1.5 }}>
                  <span style={{ color: '#6D28D9', fontWeight: 700 }}>Warm path:</span> Sarah K. ('23 grad, Consulting Analyst) — outreach message drafted.
                </p>
              </div>
            </div>

            {/* Card B — resume + outreach ready */}
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px', border: '1px solid rgba(8,145,178,0.20)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Your outreach draft is ready</p>
                <p style={{ margin: '0 0 10px', fontSize: 9, color: '#64748B', lineHeight: 1.5 }}>Resume tailored for this role + a personalized message to Sarah, written in your voice.</p>
              </div>
              <button style={{
                width: '100%', background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)', border: 'none', borderRadius: 7,
                padding: '8px', fontSize: 10, fontWeight: 800, color: '#fff',
                cursor: 'default', letterSpacing: '0.02em',
                boxShadow: '0 4px 12px rgba(109,40,217,0.30)',
              }}>
                ✉️ Review & Send
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