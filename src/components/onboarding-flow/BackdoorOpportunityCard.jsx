import CompressedOpportunityFeed from './CompressedOpportunityFeed';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const TEXT = '#111827';
const TEXT2 = '#6b7280';
const TEXT3 = '#94A3B8';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const BLUE_BRIGHT = '#3B82F6';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';
const BORDER = '#e5e7eb';
const CARD = '#ffffff';

import { useState } from 'react';

export default function BackdoorOpportunityCard({ schoolName, location, targetRole, onUnlock }) {
  const shortSchool = schoolName?.split(' ').slice(0, 2).join(' ') || 'Your School';
  const city = location === 'Remote' ? 'Miami, FL' : location || 'Miami, FL';
  const [showModal, setShowModal] = useState(false);

  const handleScriptClick = () => setShowModal(true);
  const handleModalUpgrade = () => { setShowModal(false); onUnlock(); };

  return (
    <div style={{
      background: CARD,
      borderRadius: 20,
      border: `1px solid ${BORDER}`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      marginBottom: 0,
    }}>

      {/* ── SECTION 1: The Exclusive Lead (Hook) ── */}
      <div style={{ padding: '20px 22px 16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
          {/* Company logo placeholder */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(29,78,216,0.25)',
          }}>🏢</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <p style={{ fontFamily: sat, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>
                Marketing Coordinator at{' '}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, padding: '1px 10px', fontSize: 13 }}>
                  🔒 [Top-Tier {city.split(',')[1]?.trim() || 'Miami'} Ad Agency]
                </span>
              </p>
            </div>
            <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0 }}>
              🔒 Company Hidden · {city}
            </p>
          </div>

          {/* Active signal badge */}
          <div style={{
            flexShrink: 0,
            background: GREEN_LIGHT,
            border: `1px solid ${GREEN_BORDER}`,
            borderRadius: 100,
            padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 1.8s ease-in-out infinite' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, whiteSpace: 'nowrap' }}>Active Internal Signal</span>
          </div>
        </div>

        {/* Source label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', borderRadius: 8, padding: '7px 12px', marginBottom: 4 }}>
          <span style={{ fontSize: 11 }}>🔍</span>
          <p style={{ fontFamily: dm, fontSize: 11, color: TEXT3, margin: 0 }}>
            Source: Monitored Company API &nbsp;·&nbsp; Surfaced 4 hours ago
            <span style={{ fontWeight: 700, color: '#ef4444' }}> (Hidden from major boards)</span>
          </p>
        </div>
      </div>

      {/* Connector line */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 22px', marginBottom: 0 }}>
        <div style={{ width: 2, height: 20, background: `linear-gradient(to bottom, ${BORDER}, ${BLUE_BORDER})`, marginLeft: 21, borderRadius: 2 }} />
      </div>

      {/* ── SECTION 2: The Backdoor Reveal (Twist) ── */}
      <div style={{ margin: '0 16px 0', background: BLUE_LIGHT, border: `1px solid ${BLUE_BRIGHT}`, borderRadius: 14, padding: '14px 16px', marginLeft: 16, marginRight: 16 }}>
        {/* Alert header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 15 }}>⚡</span>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: BLUE_BRIGHT, margin: 0, letterSpacing: '0.01em' }}>
            Backdoor Found: We located a <strong>{shortSchool} Alum</strong> working here.
          </p>
        </div>

        {/* Alum profile snippet — identity masked until unlock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD, border: `1px solid ${BLUE_BORDER}`, borderRadius: 10, padding: '10px 13px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
            border: `2px solid ${BLUE_BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, flexShrink: 0,
          }}>🔒</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>
              [Locked] {shortSchool} Alum
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: '2px 0 0', lineHeight: 1.5 }}>
              A {shortSchool} alum who graduated 3 years ago is a Digital Marketing Manager here.{' '}
              <span style={{ color: BLUE, fontWeight: 600 }}>Unlock to reveal her profile and let CLiFF draft the connection play.</span>
            </p>
          </div>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: '#374151', border: 'none', borderRadius: 100, padding: '3px 9px', flexShrink: 0 }}>LOCKED 🔒</span>
        </div>
      </div>

      {/* Second connector */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 22px' }}>
        <div style={{ width: 2, height: 20, background: `linear-gradient(to bottom, ${BLUE_BORDER}, ${BORDER})`, marginLeft: 21, borderRadius: 2 }} />
      </div>

      {/* ── SECTION 3: The Script Payload (Lock) ── */}
      <div style={{ margin: '0 16px 20px' }}>
        {/* Message compose box */}
        <div style={{ background: '#FAFAFA', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          {/* Compose header */}
          <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>✉️</span>
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: TEXT2, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Personalized Outreach Draft</p>
          </div>

          {/* Message body */}
          <div style={{ padding: '12px 14px', position: 'relative' }}>
            {/* Visible first line */}
            <p style={{ fontFamily: dm, fontSize: 13, color: TEXT, margin: '0 0 4px', lineHeight: 1.65, fontStyle: 'italic' }}>
              "Hey Sarah, noticed you also went to {shortSchool}...
            </p>

            {/* Blurred rest */}
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.65, fontStyle: 'italic', filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                I'm targeting {targetRole || 'marketing'} roles in {city} right now and came across the opening at Nexo. Would love to hear what the team culture is like — any chance for a quick 5-min chat? Huge thanks either way — Go Gators!
              </p>
              {/* Frosted overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,250,0.4)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRadius: 6 }} />
            </div>

            {/* Lock button centered over blur zone */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <button
                onClick={handleScriptClick}
                style={{
                  fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff',
                  background: `linear-gradient(to bottom, ${BLUE}, #1d4ed8)`,
                  border: 'none', borderRadius: 100, padding: '11px 22px',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.30)',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.30)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Unlock Personalized Outreach Script
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compressed feed below hero card */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 18px 20px' }}>
        <CompressedOpportunityFeed onUnlock={onUnlock} isRemote={location === 'Remote'} />
      </div>

      {/* CLiFF Script Popup Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', animation: 'slideModalIn 0.28s cubic-bezier(0.22,1,0.36,1)' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 36 }}>⚡</span>
            </div>
            <h3 style={{ fontFamily: sat, fontSize: 20, fontWeight: 900, color: TEXT, textAlign: 'center', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              CLiFF is ready to draft this.
            </h3>
            <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
              <p style={{ fontFamily: dm, fontSize: 13, color: '#1e3a8a', margin: 0, lineHeight: 1.7 }}>
                By leveraging your shared <strong>{shortSchool}</strong> connection, this script hits a{' '}
                <strong>4x higher response rate</strong> than a cold message.{' '}
                The [Locked] alum's full profile, title, and direct LinkedIn link will be unlocked instantly.
              </p>
            </div>
            <button
              onClick={handleModalUpgrade}
              style={{
                width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff',
                background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)`,
                border: 'none', borderRadius: 14, padding: '18px', cursor: 'pointer', minHeight: 'auto',
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)', marginBottom: 10, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(37,99,235,0.48)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.35)'; }}
            >
              Secure This Script & Get Hired →
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{ width: '100%', fontFamily: dm, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center' }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes slideModalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}