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

// Compliance-safe dynamic track mock data directory
const TRACK_DATA = {
  finance: {
    companyLabel: '[Elite Global Advisory Firm]',
    companyCity: 'New York, NY',
    jobTitle: 'Investment Banking Analyst',
    division: 'Mergers & Acquisitions (M&A)',
    insideTrackAlert: 'We located an Alum from your school working on the coverage team here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and joined the IB analyst class here. I'm tracking the upcoming summer analyst recruitment sequence and wanted to see how you managed the restructuring group process...",
  },
  tech: {
    companyLabel: '[Top-Tier Tech Company]',
    companyCity: 'San Francisco, CA',
    jobTitle: 'Software Engineering Intern',
    division: 'Core Platform & Infrastructure',
    insideTrackAlert: 'We located an Alum from your school on the engineering team here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and made the jump to this engineering team. I'm targeting SWE internship roles this cycle and wanted to hear how you approached the technical interview process...",
  },
  consulting: {
    companyLabel: '[Big 4 Consulting Firm]',
    companyCity: 'Chicago, IL',
    jobTitle: 'Business Analyst',
    division: 'Strategy & Management Consulting',
    insideTrackAlert: 'We located an Alum from your school in the consulting practice here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and landed in the consulting practice here. I'm going through recruitment right now and wanted to understand what the case interview process looked like from your side...",
  },
  marketing: {
    companyLabel: '[Top-Tier Ad Agency]',
    companyCity: 'Miami, FL',
    jobTitle: 'Marketing Coordinator',
    division: 'Creative Strategy Division',
    insideTrackAlert: 'We located an Alum from your school working here right now.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and made the jump into agency work. I'm looking into their digital marketing pipeline right now and wanted to see how you navigated the hiring process...",
  },
  healthcare: {
    companyLabel: '[Leading Healthcare Organization]',
    companyCity: 'Boston, MA',
    jobTitle: 'Clinical Research Associate',
    division: 'Research & Innovation Division',
    insideTrackAlert: 'We located an Alum from your school working in their research division here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and transitioned into clinical research here. I'm exploring roles in this space and wanted to learn how you positioned yourself coming out of school...",
  },
  law_gov: {
    companyLabel: '[Top Government Agency / Law Firm]',
    companyCity: 'Washington, DC',
    jobTitle: 'Policy Analyst',
    division: 'Government Affairs & Public Policy',
    insideTrackAlert: 'We located an Alum from your school working in their policy division here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and are now in public policy work. I'm targeting roles in this sector and wanted to hear how you broke in through this pathway...",
  },
  creative: {
    companyLabel: '[Top Creative Studio / Agency]',
    companyCity: 'Los Angeles, CA',
    jobTitle: 'Creative Associate',
    division: 'Brand & Entertainment Division',
    insideTrackAlert: 'We located an Alum from your school working in their creative team here.',
    scriptHook: "Hey Sarah, noticed you also went to the same school and joined the creative team here. I'm exploring roles in entertainment and media and wanted to understand how you got your foot in the door...",
  },
};

// Map industry bucket key + specific target roles to the best track content
function resolveTrack(selectedIndustries, targetRoles) {
  // Check specific sub-roles first for highest precision
  const roleMap = {
    'Investment Banking': 'finance',
    'Private Equity': 'finance',
    'Corporate Finance': 'finance',
    'Consulting': 'consulting',
    'Strategy': 'consulting',
    'Software Engineering': 'tech',
    'Product Management': 'tech',
    'Data Science': 'tech',
    'Pre-Med / Clinical': 'healthcare',
    'Biotech Research': 'healthcare',
    'Pharma': 'healthcare',
    'Pre-Law': 'law_gov',
    'Public Policy': 'law_gov',
    'Government / Civil Service': 'law_gov',
    'Social Media': 'marketing',
    'Content Creation': 'marketing',
    'Brand Strategy': 'marketing',
    'Product Marketing': 'marketing',
    'Film & TV': 'creative',
    'Music Industry': 'creative',
    'Sports Business': 'creative',
    'Gaming': 'creative',
  };

  for (const role of (targetRoles || [])) {
    if (roleMap[role]) return TRACK_DATA[roleMap[role]];
  }

  // Fall back to top-level bucket
  const bucketMap = {
    business: 'finance',
    tech: 'tech',
    marketing: 'marketing',
    healthcare: 'healthcare',
    law_gov: 'law_gov',
    creative: 'creative',
  };
  for (const ind of (selectedIndustries || [])) {
    if (bucketMap[ind]) return TRACK_DATA[bucketMap[ind]];
  }

  return TRACK_DATA.marketing; // safe default
}

export default function BackdoorOpportunityCard({ schoolName, location, targetRole, selectedIndustries, targetRoles, onUnlock }) {
  const shortSchool = schoolName?.split(' ').slice(0, 2).join(' ') || 'your school';

  const track = resolveTrack(selectedIndustries, targetRoles);
  const city = location === 'Remote' ? track.companyCity : location || track.companyCity;
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
              {track.jobTitle} at{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, padding: '1px 10px', fontSize: 13 }}>
                🔒 {track.companyLabel}
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
            Inside Track Found: {track.insideTrackAlert}
          </p>
        </div>

        {/* Alum profile snippet — unblurred metadata to show high-value data exists */}
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
              [Locked] Verified {shortSchool} Alum
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: '2px 0 0', lineHeight: 1.5 }}>
              {track.jobTitle} • {track.division} • Graduated 2–3 Years Ago
            </p>
          </div>
          <button
            onClick={handleScriptClick}
            style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '4px 10px', flexShrink: 0, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = BLUE_LIGHT; e.currentTarget.style.color = BLUE; }}
          >
            Unlock
          </button>
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
            {/* Visible hook line — clear and unblurred */}
            <p style={{ fontFamily: dm, fontSize: 13, color: TEXT, margin: '0 0 8px', lineHeight: 1.65, fontStyle: 'italic' }}>
              "{track.scriptHook.substring(0, 80)}...
            </p>

            {/* Blurred rest of script */}
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.65, fontStyle: 'italic', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                {track.scriptHook.substring(80)} Would love to hear what the team culture is like — any chance for a quick 5-min chat? Huge thanks either way!
              </p>
              {/* Frosted overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,250,0.5)', backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={handleScriptClick}
                  style={{
                    fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: `linear-gradient(to bottom, ${BLUE}, #1d4ed8)`,
                    border: 'none', borderRadius: 10, padding: '10px 18px',
                    cursor: 'pointer', minHeight: 'auto',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.30)',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.42)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.30)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Unlock Script
                </button>
              </div>
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