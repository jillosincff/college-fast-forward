import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const BLOCKER_LABELS = {
  resume: 'your resume not getting responses',
  ghosted: 'being ghosted after applying',
  which_jobs: 'not knowing which jobs to apply for',
  outreach: 'not knowing how to reach the right people',
  disorganized: 'feeling disorganized',
  interviews: 'interview nerves',
};

// Light theme tokens
const BG = '#f8f9fc';
const CARD = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const TEXT2 = '#6b7280';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';

function JobRow({ title, company, signal, blurred = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: blurred ? '#f3f4f6' : '#f8f9fc',
      border: `1px solid ${BORDER}`, borderRadius: 10, padding: '11px 14px', marginBottom: 8,
      filter: blurred ? 'blur(4px)' : 'none', userSelect: blurred ? 'none' : 'auto',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: TEXT, margin: 0 }}>{title}</p>
        <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: '2px 0 0' }}>{company}</p>
      </div>
      <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {signal}
      </span>
    </div>
  );
}

export default function PlanScreen({ resumeData, college, seeking, blockers = [], frustration, locationPref, locationCity, quickRole, onBack, saveAndAuth }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const firstName = resumeData?.original?.name?.split(' ')[0] || null;
  const location = locationPref === 'remote' ? 'Remote' : locationCity || resumeData?.original?.location?.split(',')[0] || 'your city';
  const targetRole = quickRole || (seeking === 'internship' ? 'internship' : seeking === 'fulltime' ? 'full-time role' : 'opportunity');
  const schoolName = college || 'your university';
  const mainBlocker = blockers[0] ? BLOCKER_LABELS[blockers[0]] : 'not knowing which roles are real';

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 100, paddingBottom: 120, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes fadUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseBlue { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.35)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0.0)} }
        @keyframes notifIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .plan-sticky-cta { display: none; }
        @media (max-width: 767px) {
          .plan-sticky-cta { display: flex; }
        }
      `}</style>

      {/* ── Mobile Sticky CTA ── */}
      <div className="plan-sticky-cta" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', borderTop: '1px solid #E2E8F0',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        flexDirection: 'column', alignItems: 'stretch', gap: 8,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={() => setShowPaywall(true)}
          style={{
            width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
          }}
        >
          Unlock My 14-Day Action Plan →
        </button>
        <button onClick={saveAndAuth} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textAlign: 'center', textDecoration: 'underline' }}>
          Save progress and continue for free
        </button>
      </div>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
          {['Resume Wow', 'LinkedIn Identity', 'Your Plan'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i < 2 ? GREEN : BLUE,
                  border: `2px solid ${i < 2 ? GREEN : BLUE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: dm,
                  boxShadow: i === 2 ? '0 0 0 4px rgba(37,99,235,0.2), 0 0 16px rgba(37,99,235,0.4)' : 'none',
                  animation: i === 2 ? 'pulseBlue 2s ease-in-out infinite' : 'none',
                }}>
                  {i < 2 ? '✓' : '3'}
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, color: i === 2 ? BLUE : GREEN, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: GREEN_BORDER, borderRadius: 2, marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
          <span style={{ fontSize: 13 }}>🗺️</span>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 3 — Your 14-Day Action Plan</span>
        </div>
      </div>

      {/* ── Hero Headline ── */}
      <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 8px' }}>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(24px, 4.5vw, 40px)', fontWeight: 900, color: TEXT, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {firstName ? `${firstName}, let's stop guessing` : "Let's stop guessing"}{' '}
          <span style={{ color: BLUE }}>and start interviewing.</span>
        </h1>
        <p style={{ fontFamily: dm, fontSize: 16, color: TEXT2, lineHeight: 1.7, margin: '0 auto', maxWidth: 560 }}>
          We didn't just fix your resume. We found the open doors.{' '}
          Right now, there are <strong style={{ color: TEXT }}>14 active {targetRole} roles in {location}</strong> that match your profile — and they're hiring <strong style={{ color: TEXT }}>this week.</strong>
        </p>
      </div>

      {/* ── Mock Interview Notification (The Visual Prize) ── */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '20px 24px', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', animation: 'notifIn 0.6s ease' }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>🎯 This is what your plan is designed to generate:</p>
        <div style={{ background: '#f0fdf4', border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📅</div>
          <div>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: GREEN, margin: '0 0 2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Interview Request Received</p>
            <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 4px' }}>Nova Agency — Monday at 10:00 AM</p>
            <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0 }}>Marketing Coordinator · {location} · In-Person</p>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0, background: GREEN, color: '#fff', fontFamily: dm, fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '4px 10px' }}>NEW</div>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '12px 0 0', lineHeight: 1.6 }}>
          We've already identified the <strong style={{ color: TEXT }}>3 companies most likely to send you this notification</strong> by next Friday.
          {firstName ? ` Your plan shows you exactly how, ${firstName}.` : ' Your plan shows you exactly how.'}
        </p>
      </div>

      {/* ── Old Way vs Fast Forward Comparison ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 16, padding: '20px 18px' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>❌ The Old Way</p>
          {[
            ['2%', 'response rate on applications'],
            ['40 hrs', 'of searching per week'],
            ['~60%', 'of postings are ghost jobs'],
          ].map(([n, l], i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ fontFamily: sat, fontSize: 18, fontWeight: 900, color: '#ef4444', margin: '0 0 1px' }}>{n}</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
        <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 16, padding: '20px 18px' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>✅ The Fast Forward Way</p>
          {[
            ['18%', 'avg response rate on our leads'],
            ['4 hrs', 'of focused work per week'],
            ['100%', 'verified active hiring signals'],
          ].map(([n, l], i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ fontFamily: sat, fontSize: 18, fontWeight: 900, color: GREEN, margin: '0 0 1px' }}>{n}</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Free Sample Insight ── */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 20, padding: '22px 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your Free Insider Tip — No Sign-Up Needed</p>
        </div>
        <p style={{ fontFamily: dm, fontSize: 14, color: TEXT, lineHeight: 1.7, margin: '0 0 10px' }}>
          The <strong>top actively-hiring agency in {location} right now</strong> is Nova Agency. They have <strong>2 open {targetRole} roles</strong> and their lead recruiter has a 78% LinkedIn reply rate.
        </p>
        <p style={{ fontFamily: dm, fontSize: 13, color: BLUE, margin: 0, fontWeight: 600 }}>
          → We've already drafted your intro message to her. It's waiting inside your plan.
        </p>
      </div>

      {/* ── Vested Timeline ── */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 20px' }}>✓ What We've Already Done For You</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { icon: '📄', color: GREEN, borderColor: '#10b981', label: 'RESUME OPTIMIZED', desc: 'Your draft is now a 97/100 recruiter-ready asset.' },
            { icon: '💼', color: BLUE, borderColor: '#3b82f6', label: 'LINKEDIN REBUILT', desc: 'Your digital identity is keyword-optimized and searchable.' },
            { icon: '🗺️', color: '#7c3aed', borderColor: '#7c3aed', label: 'PLAN GENERATED', desc: `14-day ${targetRole} sprint mapped for ${location}.` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', paddingBottom: i < 2 ? 22 : 0 }}>
              {i < 2 && <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: BORDER }} />}
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${item.borderColor}`, background: `${item.borderColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✓</span> {item.label}
                </p>
                <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Glass-Lock Preview Cards ── */}
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>What's Inside Your Plan</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>

        {/* Card A: Fast Track Feed */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: TEXT, display: 'block' }}>The "Fast Track" Feed</span>
              <span style={{ fontFamily: dm, fontSize: 11, color: TEXT2 }}>We found 12 jobs where the hiring manager is actively interviewing right now.</span>
            </div>
          </div>
          <div style={{ padding: '14px 20px 10px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: '0 0 10px' }}>Live {targetRole} roles · {location} · Verified hiring signals</p>
            <JobRow title="Marketing Coordinator" company="Nova Agency · Miami, FL" signal="✅ Actively Hiring" />
          </div>
          <div style={{ position: 'relative', padding: '0 20px' }}>
            <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <JobRow title="Brand Strategy Intern" company="Futura Co · Miami, FL" signal="✅ Actively Hiring" blurred />
              <JobRow title="Growth Marketing Associate" company="Sunlight Media · Remote" signal="✅ Actively Hiring" blurred />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(248,249,252,0) 0%, rgba(248,249,252,0.85) 55%, rgba(248,249,252,1) 100%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ background: CARD, padding: '10px 20px 18px', textAlign: 'center' }}>
            <button onClick={() => setShowPaywall(true)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🔒 Unlock 11 More Active Leads
            </button>
          </div>
        </div>

        {/* Card B: Insider Bridge */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🤝</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: TEXT, display: 'block' }}>The "Insider" Bridge</span>
              <span style={{ fontFamily: dm, fontSize: 11, color: TEXT2 }}>3 {schoolName} alumni are ready to skip you to the front of the line.</span>
            </div>
          </div>
          <div style={{ padding: '14px 20px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Sarah K. · {schoolName} Alum</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: '2px 0 0' }}>Senior Marketing Manager · Top {location} Agency</p>
              </div>
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '3px 9px', flexShrink: 0 }}>WARM</span>
            </div>
          </div>
          <div style={{ position: 'relative', padding: '0 20px 0' }}>
            <div style={{ background: '#f8f9fc', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', userSelect: 'none', pointerEvents: 'none' }}>
              <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>
                "Hi Sarah — fellow {schoolName} alum here! I noticed you're at [Agency]..."
              </p>
              <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '6px 0 0', lineHeight: 1.65, fontStyle: 'italic', filter: 'blur(3.5px)' }}>
                I'm targeting {targetRole} roles in {location} and would love 5 minutes to hear about the team. Any chance for a quick chat?
              </p>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(to bottom, rgba(255,255,255,0), ${CARD})`, pointerEvents: 'none' }} />
          </div>
          <div style={{ background: CARD, padding: '10px 20px 18px', textAlign: 'center' }}>
            <button onClick={() => setShowPaywall(true)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🔒 Unlock 3 Alumni Connections
            </button>
          </div>
        </div>

        {/* Card C: Hiring CRM */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: TEXT, display: 'block' }}>Your Personal Hiring CRM</span>
              <span style={{ fontFamily: dm, fontSize: 11, color: TEXT2 }}>Your agent tracks everything. You just show up to interviews.</span>
            </div>
          </div>
          <div style={{ padding: '16px 20px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[{ n: '7', label: 'Jobs Applied', color: BLUE }, { n: '2', label: 'Interviews Scheduled', color: GREEN }, { n: '3', label: 'Follow-ups Due', color: '#f97316' }].map((s, i) => (
                <div key={i} style={{ background: '#f8f9fc', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <p style={{ fontFamily: sat, fontSize: 26, fontWeight: 900, color: s.color, margin: '0 0 3px' }}>{s.n}</p>
                  <p style={{ fontFamily: dm, fontSize: 10, color: TEXT2, margin: 0, lineHeight: 1.3 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 10, padding: '11px 14px', marginBottom: 8 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: GREEN, margin: 0 }}>
                🎯 You have 2 interviews waiting to be scheduled. Unlock to see the companies and your prep notes.
              </p>
            </div>
          </div>
          <div style={{ position: 'relative', padding: '0 20px' }}>
            <div style={{ userSelect: 'none', pointerEvents: 'none', filter: 'blur(4px)' }}>
              {['Nova Agency — Interview prep notes ready', 'Futura Co — Follow-up sent · Day 3', 'Sunlight Media — Application pending review'].map((line, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? GREEN : BLUE, flexShrink: 0 }} />
                  <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(255,255,255,0) 10%, ${CARD} 75%)`, pointerEvents: 'none' }} />
          </div>
          <div style={{ background: CARD, padding: '10px 20px 18px', textAlign: 'center' }}>
            <button onClick={() => setShowPaywall(true)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🔒 Access My Activity Tracker
            </button>
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 24, padding: '36px 28px', marginBottom: 20, boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
        <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, margin: '0 0 6px' }}>
          You don't have to do this alone anymore.
        </p>
        <h2 style={{ fontFamily: sat, fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {firstName ? `${firstName}, let's get you hired.` : "Let's get you hired."} 🎯
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
          The Verified Feed · The Insider DM · Your Daily 14-Day Sprint
        </p>

        <button
          onClick={() => setShowPaywall(true)}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 12px',
            fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none', borderRadius: 18, padding: '22px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(22,163,74,0.5), 0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)'; }}
        >
          Unlock My 14-Day Action Plan — $4.99/wk →
        </button>
        <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '0 0 16px' }}>
          🎁 Invite a friend and your first week is on us.
        </p>
        <button
          onClick={saveAndAuth}
          style={{ fontFamily: dm, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
        >
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div
          onClick={() => setShowPaywall(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', animation: 'fadUp 0.25s ease', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>🗺️</div>
            <h2 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: TEXT, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your 14-Day Plan</h2>
            <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>The Fast Track Feed, Insider Alumni Bridge, Personal Hiring CRM, and unlimited AI coaching.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: '#f9fafb', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>$4.99 / week</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '3px 0 0' }}>Cancel anytime</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '3px 10px' }}>Most flexible</span>
              </button>

              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: `2px solid ${GREEN}`, borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
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

            <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, textAlign: 'center', margin: '16px 0 0' }}>🎁 Invite a friend — get your first week free</p>

            <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: dm, fontSize: 14, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 20 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}