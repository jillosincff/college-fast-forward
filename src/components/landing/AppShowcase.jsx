import { useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";

// Dashboard UI mock — built entirely in-code so there's no external screenshot dependency
function DashboardMock() {
  const apps = [
    { color: '#EF4444', label: '' }, { color: '#F59E0B', label: '' }, { color: '#10B981', label: '' },
  ];

  const pipeline = [
    { company: 'Stripe', role: 'Product Intern', stage: 'Applied', stageColor: '#3B82F6', stageBg: '#EFF6FF' },
    { company: 'Figma', role: 'Marketing Analyst', stage: 'Interview', stageColor: '#7C3AED', stageBg: '#F5F3FF' },
    { company: 'Salesforce', role: 'BDR Internship', stage: 'Offer ✓', stageColor: '#10B981', stageBg: '#F0FDF4' },
    { company: 'HubSpot', role: 'Growth Intern', stage: 'Awaiting', stageColor: '#F59E0B', stageBg: '#FFFBEB' },
  ];

  const actions = [
    { icon: '📄', label: 'Resume Tailored', sub: 'Stripe → ATS score 98/100', color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
    { icon: '✉️', label: 'Outreach Drafted', sub: 'Sarah K. @ Meta — Alumni intro', color: '#0066FF', bg: '#EFF6FF', border: '#BFDBFE' },
    { icon: '🎤', label: 'Interview Prep', sub: 'Behavioral Q&A ready', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: '#0F172A', borderRadius: 12, overflow: 'hidden', minHeight: 440, display: 'flex', flexDirection: 'column' }}>
      {/* Browser chrome */}
      <div style={{ background: '#1E293B', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {apps.map((d, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
          ))}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#10B981' }}>🔒</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>app.collegefastforward.com/dashboard</span>
        </div>
      </div>

      {/* App shell */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 48, background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 8 }}>
          {['⚡', '📋', '🔍', '✉️'].map((icon, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? 'rgba(0,102,255,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: i === 0 ? '1px solid rgba(0,102,255,0.3)' : 'none' }}>
              {icon}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>Good morning, Marcus 👋</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Your Agent found 3 new insider contacts today</p>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>Agent Active</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Pipeline */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Application Pipeline</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pipeline.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#F1F5F9' }}>{item.company}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{item.role}</p>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: item.stageColor, background: item.stageBg, borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>{item.stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((a, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: a.bg, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#F1F5F9' }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.sub}</p>
                  </div>
                </div>
              ))}
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