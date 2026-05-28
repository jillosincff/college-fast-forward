import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

const MOCK_ALUMNI = {
  Salesforce: [
    { name: 'Marcus Reid', title: 'Account Executive', grad: '2019', mutual: true },
    { name: 'Priya Nair', title: 'Business Development Rep', grad: '2021', mutual: false },
    { name: 'Jason Cho', title: 'Solutions Engineer', grad: '2020', mutual: true },
  ],
  Deloitte: [
    { name: 'Alicia Torres', title: 'Consulting Analyst', grad: '2020', mutual: true },
    { name: 'Ben Walsh', title: 'Technology Consultant', grad: '2022', mutual: false },
    { name: 'Naomi Patel', title: 'Senior Associate', grad: '2018', mutual: true },
    { name: 'Derek Kim', title: 'Strategy Analyst', grad: '2021', mutual: false },
    { name: 'Lauren Moss', title: 'Manager, Tech Advisory', grad: '2017', mutual: false },
  ],
  Amazon: [
    { name: 'Carlos Vega', title: 'Operations Analyst', grad: '2021', mutual: false },
    { name: 'Tiffany Grant', title: 'Program Manager', grad: '2019', mutual: true },
  ],
};

const MOCK_PARENTS = {
  Salesforce: [
    { name: 'Robert Chen', title: 'VP of Enterprise Sales', student: 'Sophie Chen, UF \'25' },
    { name: 'Diana Okafor', title: 'Senior Director, Partnerships', student: 'Emeka Okafor, UF \'26' },
  ],
  Deloitte: [
    { name: 'James Whitfield', title: 'Managing Director', student: 'Alex Whitfield, UF \'25' },
  ],
  Amazon: [
    { name: 'Susan Park', title: 'Director, Ops Excellence', student: 'Jason Park, UF \'26' },
    { name: 'Michael Torres', title: 'Sr. Manager, Logistics', student: 'Camila Torres, UF \'25' },
    { name: 'Angela Wu', title: 'Principal PM', student: 'Kevin Wu, UF \'24' },
  ],
};

const MATCH_REASONS = {
  Salesforce: [
    'Your major aligns with BDR career trajectory',
    'Resume shows CRM & outreach experience',
    '3 UF alumni warm intro paths available',
    '2 UF parents opted in for referrals',
  ],
  Deloitte: [
    'GPA + consulting internship experience match',
    'Case study background detected on resume',
    '5 UF alumni warm intro paths available',
    '1 UF parent referral available',
  ],
  Amazon: [
    'Operations coursework matches role requirements',
    'Leadership experience detected',
    '2 UF alumni warm intro paths available',
    '3 UF parents opted in for referrals',
  ],
};

export default function MatchDeepDiveModal({ match, shortName, onClose, onGenerateOutreach }) {
  const [tab, setTab] = useState('alumni');
  const [selectedContact, setSelectedContact] = useState(null);

  if (!match) return null;

  const alumni = MOCK_ALUMNI[match.company] || MOCK_ALUMNI.Salesforce;
  const parents = MOCK_PARENTS[match.company] || MOCK_PARENTS.Salesforce;
  const reasons = MATCH_REASONS[match.company] || MATCH_REASONS.Salesforce;
  const contacts = tab === 'alumni' ? alumni : parents;

  const handleGenerate = () => {
    const contact = selectedContact || (tab === 'alumni' ? alumni[0] : parents[0]);
    onGenerateOutreach && onGenerateOutreach({ match, contact, tab });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>

        {/* Drag handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px' }}>

          {/* ── Zone 1: Tactical Overview ── */}
          <div style={{ paddingTop: 4, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {match.logo}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 2px' }}>{match.company}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#64748b', margin: 0 }}>{match.role}</p>
              </div>
              <button
                onClick={onClose}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#64748b', minHeight: 'auto', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Match score */}
            <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)', border: '1px solid #c7d2fe', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                  CLIFF Match: {match.matchPct}% — Here's why
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: '#fff' }}>✓</span>
                    </div>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Network summary pills */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#2563eb', margin: '0 0 2px' }}>{match.alumCount}</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: 0, fontWeight: 600 }}>🎓 {shortName} Alumni</p>
              </div>
              <div style={{ flex: 1, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#7c3aed', margin: '0 0 2px' }}>{match.parentCount}</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: 0, fontWeight: 600 }}>👨‍👩‍👧 {shortName} Parents</p>
              </div>
            </div>
          </div>

          {/* ── Zone 2: Warm Connections Grid ── */}
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🔓 Your Warm Network — Unlocked
              </p>
              <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 8px', textTransform: 'uppercase' }}>Premium</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 10, padding: 4, marginBottom: 14 }}>
              {['alumni', 'parents'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedContact(null); }}
                  style={{
                    flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700,
                    color: tab === t ? '#fff' : '#64748b',
                    background: tab === t ? (t === 'alumni' ? '#2563eb' : '#7c3aed') : 'transparent',
                    border: 'none', borderRadius: 7, padding: '7px 0', cursor: 'pointer',
                    minHeight: 'auto', transition: 'all 0.2s',
                  }}
                >
                  {t === 'alumni' ? `🎓 Alumni (${alumni.length})` : `👨‍👩‍👧 Parents (${parents.length})`}
                </button>
              ))}
            </div>

            {/* Contact cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c, i) => {
                const isAlum = tab === 'alumni';
                const isSelected = selectedContact === c;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedContact(isSelected ? null : c)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: isSelected ? (isAlum ? '#eff6ff' : '#f5f3ff') : '#f8fafc',
                      border: `1.5px solid ${isSelected ? (isAlum ? '#93c5fd' : '#c4b5fd') : '#e2e8f0'}`,
                      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: isAlum ? '#dbeafe' : '#ede9fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: dm, fontSize: 14, fontWeight: 800,
                      color: isAlum ? '#2563eb' : '#7c3aed',
                    }}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                      <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isAlum ? `${c.title} · Class of ${c.grad}` : `${c.title} · Parent of ${c.student}`}
                      </p>
                    </div>

                    {isAlum && c.mutual && (
                      <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 100, padding: '2px 7px', flexShrink: 0 }}>
                        Mutual
                      </span>
                    )}
                    {!isAlum && (
                      <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 100, padding: '2px 7px', flexShrink: 0 }}>
                        Opted-in
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedContact && (
              <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', fontWeight: 600, margin: '10px 0 0', textAlign: 'center' }}>
                ✓ {selectedContact.name} selected for outreach
              </p>
            )}
          </div>

          {/* ── Zone 3: Action Hand-off ── */}
          <div style={{ paddingTop: 20 }}>
            <button
              onClick={handleGenerate}
              style={{
                width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: 14, padding: '16px 0', cursor: 'pointer',
                minHeight: 'auto', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
            >
              <span style={{ fontSize: 16 }}>🚀</span>
              Generate Outreach via CLIFF
            </button>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0' }}>
              Bypasses ATS — sends directly through your warm network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}