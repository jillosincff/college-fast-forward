import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

const BACKDOOR_LEADS = [
  {
    company: 'Salesforce',
    role: 'Business Development Representative',
    source: 'Alumni connection · 3 UF grads on team',
    recruiter: 'Sarah M., Campus Recruiter',
    posted: 'Not yet public',
    logo: '☁️',
  },
  {
    company: 'Amazon',
    role: 'Operations Analyst — Summer Intern',
    source: 'Parent network · VP referred students',
    recruiter: 'James K., University Relations',
    posted: 'Soft-listed internally',
    logo: '📦',
  },
  {
    company: 'Deloitte',
    role: 'Consulting Analyst, Technology',
    source: 'Alumni spider · 5 UF alums, 2 recent',
    recruiter: 'Michelle T., Talent Acquisition',
    posted: 'Expected live in 2 weeks',
    logo: '🏢',
  },
];

const COLUMNS = ['OPPORTUNITIES', 'APPLIED', 'INTERVIEWING', 'OFFER 🎉'];

function LeadCard({ lead, onOpen }) {
  return (
    <div
      onClick={() => onOpen(lead)}
      style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {lead.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{lead.role}</p>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#2563eb', margin: 0 }}>{lead.company}</p>
        </div>
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 10px', marginBottom: 8 }}>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0, fontWeight: 600 }}>🔍 {lead.source}</p>
      </div>
      <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>📋 {lead.posted}</p>
    </div>
  );
}

function LeadDetailModal({ lead, onClose }) {
  const [copied, setCopied] = useState(false);

  const script = `Hi ${lead.recruiter.split(',')[0]},\n\nI came across the ${lead.role} opportunity at ${lead.company} through the College Fast Forward alumni network. I'm a senior actively pursuing this exact type of role, and was thrilled to see that several ${lead.source.includes('UF') ? 'UF' : 'campus'} alumni are already on your team.\n\nI'd love to connect briefly to learn more about the opportunity and share how my background aligns.\n\nThank you for your time,\n[Your Name]`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { alert(script); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 460, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{lead.logo}</div>
          <div>
            <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{lead.role}</p>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#2563eb', fontWeight: 600, margin: 0 }}>{lead.company}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {[
            { label: '🔍 Source', value: lead.source },
            { label: '👤 Internal Contact', value: lead.recruiter },
            { label: '📋 Listing Status', value: lead.posted },
          ].map(row => (
            <div key={row.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10 }}>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: 0, flexShrink: 0, minWidth: 120 }}>{row.label}</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#111827', margin: 0, lineHeight: 1.5 }}>{row.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Outreach Script</p>
          <pre style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7, maxHeight: 160, overflowY: 'auto' }}>{script}</pre>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{ flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: copied ? '#6b7280' : 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.2s' }}
          >
            {copied ? '✅ Copied!' : '📋 Copy Script'}
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', minHeight: 'auto' }}
          >
            ⚡ Auto-Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPipeline({ theme, onLeadSelect }) {
  const t = theme || { primary: '#2563eb' };
  const [cards, setCards] = useState({
    'OPPORTUNITIES': BACKDOOR_LEADS,
    'APPLIED': [],
    'INTERVIEWING': [],
    'OFFER 🎉': [],
  });
  const [selectedLead, setSelectedLead] = useState(null);

  const handleLeadOpen = (lead) => {
    setSelectedLead(lead);
    if (onLeadSelect) onLeadSelect(lead);
  };
  const [newCard, setNewCard] = useState({ col: null, text: '' });

  const addCard = (col) => {
    if (!newCard.text.trim()) { setNewCard({ col: null, text: '' }); return; }
    setCards(prev => ({ ...prev, [col]: [...prev[col], { company: newCard.text, role: 'Position', source: 'Manual entry', recruiter: '—', posted: '—', logo: '🏢' }] }));
    setNewCard({ col: null, text: '' });
  };

  return (
    <>
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>My Application Pipeline</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0, fontWeight: 600 }}>✅ Unlimited tracking · 3 backdoor leads loaded</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', gap: 0, minWidth: 720 }}>
            {COLUMNS.map((col, ci) => (
              <div key={col} style={{ borderRight: ci < 3 ? '1px solid #f3f4f6' : 'none', padding: '14px 14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ci === 0 ? '#2563eb' : ci === 1 ? '#f59e0b' : ci === 2 ? '#8b5cf6' : '#16a34a' }} />
                  <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col}</p>
                  <span style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 100, padding: '1px 7px', marginLeft: 'auto' }}>{cards[col]?.length || 0}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 80 }}>
                  {col === 'OPPORTUNITIES'
                    ? cards[col].map((lead, i) => <LeadCard key={i} lead={lead} onOpen={handleLeadOpen} />)
                    : cards[col].map((item, i) => (
                      <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{item.role}</p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>{item.company}</p>
                      </div>
                    ))
                  }

                  {/* Add card input */}
                  {newCard.col === col ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        autoFocus
                        value={newCard.text}
                        onChange={e => setNewCard(n => ({ ...n, text: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') addCard(col); if (e.key === 'Escape') setNewCard({ col: null, text: '' }); }}
                        placeholder="Company or role name..."
                        style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 10px', outline: 'none', minHeight: 'auto' }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => addCard(col)} style={{ flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Add</button>
                        <button onClick={() => setNewCard({ col: null, text: '' })} style={{ flex: 1, fontFamily: dm, fontSize: 11, color: '#6b7280', background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewCard({ col, text: '' })}
                      style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', background: 'none', border: '1px dashed #e5e7eb', borderRadius: 10, padding: '8px 0', cursor: 'pointer', minHeight: 'auto', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#bfdbfe'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      + Add card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}