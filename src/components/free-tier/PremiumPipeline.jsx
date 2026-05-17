import { useState } from 'react';
import OpportunityDrawer from './OpportunityDrawer';

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

function LeadCard({ lead, onOpen, columnId }) {
  const emailSyncActive = lead.emailSyncStatus === 'active';
  
  return (
    <div
      onClick={() => onOpen(lead)}
      style={{ 
        background: '#fff', 
        border: '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: '14px 16px', 
        cursor: 'pointer', 
        transition: 'all 0.2s', 
        boxShadow: emailSyncActive ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
        position: 'relative',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = emailSyncActive ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      {emailSyncActive && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }`}</style>
        </div>
      )}
      
      {/* Top Row: Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {lead.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.role}</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{lead.company}</p>
        </div>
      </div>
      
      {/* Middle & Bottom Rows: Column-Specific Metadata */}
      {columnId === 'opportunities' && (
        <>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#2563eb', margin: 0, fontWeight: 600 }}>💡 {lead.connectionsCount || 3} UF Connections</p>
          </div>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#3b82f6', margin: 0, fontWeight: 500 }}>Click to open Backdoor Access →</p>
        </>
      )}
      
      {columnId === 'applied' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0 }}>📅 Applied: {lead.appliedDate ? new Date(lead.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Auto-detecting...'}</p>
            {lead.tailoredResume && (
              <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0 }}>📄 Version: {lead.tailoredResume.fileName.replace('.pdf', '').split('_').pop() || 'Tailored'}</p>
            )}
          </div>
          <p style={{ fontFamily: dm, fontSize: 9, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />
            Email Agent Syncing...
          </p>
        </>
      )}
      
      {columnId === 'interviewing' && (
        <>
          <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#7c3aed', margin: 0, fontWeight: 600 }}>📅 {lead.interviewRound || 'Round 1'}: {lead.interviewDate ? new Date(lead.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</p>
          </div>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#6366f1', margin: 0, fontWeight: 500 }}>🔗 View Sent Resume</p>
        </>
      )}
      
      {columnId === 'offer' && (
        <>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#15803d', margin: 0, fontWeight: 700 }}>🎉 Offer Unlocked</p>
          </div>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 500 }}>💰 View Negotiation Tools →</p>
        </>
      )}
    </div>
  );
}



export default function PremiumPipeline({ theme, onLeadSelect, user, college, parentCount }) {
  const t = theme || { primary: '#2563eb' };
  const [cards, setCards] = useState({
    'OPPORTUNITIES': BACKDOOR_LEADS,
    'APPLIED': [],
    'INTERVIEWING': [],
    'OFFER 🎉': [],
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleLeadOpen = (lead) => {
    setSelectedLead(lead);
    if (onLeadSelect) onLeadSelect(lead);
  };

  const handleApplied = (lead) => {
    const lastName = user?.full_name?.split(' ')[1] || user?.full_name?.split(' ')[0] || 'Resume';
    const tailoredResume = {
      fileName: `Resume_${lastName}_${lead.company.replace(/\s+/g, '')}.pdf`,
      tailoredAt: new Date().toISOString(),
      tailoredFor: lead.company,
      tailoredForRole: lead.role,
    };
    
    setCards(prev => ({
      ...prev,
      'OPPORTUNITIES': prev['OPPORTUNITIES'].filter(l => l.company !== lead.company || l.role !== lead.role),
      'APPLIED': [...prev['APPLIED'], { ...lead, appliedDate: new Date().toISOString(), tailoredResume }],
    }));
    setSelectedLead(null);
  };
  const [newCard, setNewCard] = useState({ col: null, text: '' });

  const addCard = (col) => {
    if (!newCard.text.trim()) { setNewCard({ col: null, text: '' }); return; }
    setCards(prev => ({ ...prev, [col]: [...prev[col], { company: newCard.text, role: 'Position', source: 'Manual entry', recruiter: '—', posted: '—', logo: '🏢' }] }));
    setNewCard({ col: null, text: '' });
  };

  return (
    <>
      {selectedLead && (
        <OpportunityDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onApplied={handleApplied}
          user={user}
          college={college}
          theme={t}
          parentCount={parentCount}
        />
      )}
      
      {/* Card Details Modal */}
      {selectedCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedCard(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', maxWidth: 420, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{selectedCard.role}</p>
                <p style={{ fontFamily: dm, fontSize: 13, color: '#2563eb', margin: 0 }}>{selectedCard.company}</p>
              </div>
              <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
            </div>
            
            {selectedCard.appliedDate && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase' }}>Application Status</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#111827', margin: 0 }}>Applied on {new Date(selectedCard.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )}
            
            {selectedCard.tailoredResume && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#15803d', margin: '0 0 6px', textTransform: 'uppercase' }}>Submitted Resume</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  <p style={{ fontFamily: dm, fontSize: 11, color: '#166534', margin: 0, fontWeight: 600 }}>{selectedCard.tailoredResume.fileName}</p>
                </div>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#15803d', margin: '0 0 10px' }}>Tailored for {selectedCard.tailoredResume.tailoredFor} • {selectedCard.tailoredResume.tailoredForRole}</p>
                <button
                  onClick={() => alert(`Downloading ${selectedCard.tailoredResume.fileName}...`)}
                  style={{ width: '100%', fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#16a34a', border: 'none', borderRadius: 8, padding: '8px 0', cursor: 'pointer', minHeight: 'auto' }}
                >
                  📥 Download Resume
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectedCard(null)} style={{ flex: 1, fontFamily: dm, fontSize: 12, color: '#6b7280', background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer', minHeight: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      
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
                    ? cards[col].map((lead, i) => <LeadCard key={i} lead={lead} columnId="opportunities" onOpen={handleLeadOpen} />)
                    : cards[col].map((item, i) => (
                      <LeadCard 
                        key={i} 
                        lead={item} 
                        columnId={col === 'APPLIED' ? 'applied' : col === 'INTERVIEWING' ? 'interviewing' : 'offer'}
                        onOpen={setSelectedCard} 
                      />
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