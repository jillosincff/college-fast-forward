import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { base44 } from '@/api/base44Client';
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
    alumCount: 3,
    jobDescriptionText: `Salesforce is looking for a high-energy Business Development Representative to join our commercial sales team. You'll be the first point of contact for new mid-market accounts, sourcing pipeline, and qualifying leads.\n\nWhat You'll Do:\n• Outbound prospecting via phone, email, and social channels\n• Partner with Account Executives to strategize target accounts\n• Achieve monthly quotas of qualified opportunities\n\nWhat They're Looking For:\n• Strong communication skills and thick skin for cold outreach\n• Competitive mindset (former athletes, student leaders, or sales club grads excel here)\n• Bachelor's degree from an accredited university`,
  },
  {
    company: 'Amazon',
    role: 'Operations Analyst — Summer Intern',
    source: 'Parent network · VP referred students',
    recruiter: 'James K., University Relations',
    posted: 'Soft-listed internally',
    logo: '📦',
    alumCount: 2,
    jobDescriptionText: `Join Amazon's Operations team as a Summer Intern and gain hands-on experience optimizing supply chain processes. You'll work on real projects that impact millions of customers.\n\nWhat You'll Do:\n• Analyze operational data to identify process improvements\n• Collaborate with cross-functional teams on workflow optimization\n• Present findings to senior leadership\n\nWhat They're Looking For:\n• Currently pursuing a degree in Engineering, Business, or related field\n• Strong analytical and problem-solving skills\n• Proficiency in Excel and data visualization tools`,
  },
  {
    company: 'Deloitte',
    role: 'Consulting Analyst, Technology',
    source: 'Alumni spider · 5 UF alums, 2 recent',
    recruiter: 'Michelle T., Talent Acquisition',
    posted: 'Expected live in 2 weeks',
    logo: '🏢',
    alumCount: 5,
    jobDescriptionText: `Deloitte's Technology Consulting practice helps clients transform their businesses through innovative technology solutions. As an Analyst, you'll work on cutting-edge implementations.\n\nWhat You'll Do:\n• Support technology strategy and implementation projects\n• Conduct research and analysis on emerging tech trends\n• Collaborate with clients to understand business requirements\n\nWhat They're Looking For:\n• Bachelor's degree in Computer Science, Information Systems, or related field\n• Strong communication and presentation skills\n• Interest in emerging technologies and business transformation`,
  },
];

const COLUMNS = ['OPPORTUNITIES', 'APPLIED', 'INTERVIEWING', 'OFFER 🎉'];

function LeadCard({ lead, onOpen, columnId, onTriggerNudge, onDelete, cardIndex, columnKey }) {
  const emailSyncActive = lead.emailSyncStatus === 'active';
  const [viewed, setViewed] = useState(false);

  // Check for stale application nudge
  const checkNudgeStatus = () => {
    if (!lead.appliedDate && columnId !== 'applied' && columnId !== 'interviewing') return null;
    const lastActivity = lead.lastActivityDate || lead.appliedDate;
    if (!lastActivity) return null;
    const daysStagnant = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
    
    if (columnId === 'applied' && daysStagnant >= 5) {
      return { type: 'FOLLOW_UP', text: `⏰ ${daysStagnant}d Silence — Follow up`, days: daysStagnant };
    }
    if (columnId === 'interviewing' && daysStagnant >= 3) {
      return { type: 'THANK_YOU', text: `⚡ ${daysStagnant}d — Send Thank You`, days: daysStagnant };
    }
    return null;
  };

  const nudge = checkNudgeStatus();

  const handleClick = () => {
    setViewed(true);
    onOpen(lead);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Remove ${lead.role} at ${lead.company} from your pipeline?`)) {
      onDelete && onDelete(columnKey, cardIndex);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{ 
        background: '#fff', 
        border: viewed ? '1px dashed #cbd5e1' : '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: '14px 16px', 
        cursor: 'pointer', 
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
        boxShadow: emailSyncActive ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
        position: 'relative',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: viewed ? 0.8 : 1,
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)'; 
        e.currentTarget.style.borderColor = '#E85D20';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.boxShadow = emailSyncActive ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)'; 
        e.currentTarget.style.borderColor = viewed ? '#cbd5e1' : '#e5e7eb';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle chevron indicator in top-right corner */}
      <div style={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', fontSize: 16, lineHeight: 1, pointerEvents: 'none' }}>›</div>
      
      {emailSyncActive && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }`}</style>
        </div>
      )}
      
      {/* Top Row: Logo + Title + Delete Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {lead.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.role}</p>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: '#64748b', margin: '2px 0 0' }}>{lead.company}</p>
        </div>
        <button
          onClick={handleDelete}
          style={{ background: 'none', border: 'none', fontSize: 16, color: '#94a3b8', cursor: 'pointer', padding: '4px', lineHeight: 1, opacity: 0.6, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = 1; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.opacity = 0.6; }}
          title="Remove from pipeline"
        >
          ×
        </button>
      </div>
      
      {/* Middle & Bottom Rows: Column-Specific Metadata */}
      {columnId === 'opportunities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Alumni strip — brand blue for maximum pop */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#2563eb', margin: 0, fontWeight: 700 }}>🐊 {lead.alumCount || 3} {lead.schoolShortName || 'UF'} grads work here</p>
          </div>
          {/* CLIFF AI match micro-badge */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 6, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11 }}>⚡</span>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', margin: 0, fontWeight: 700 }}>
              CLIFF Match: {lead.alumCount >= 5 ? '96%' : lead.alumCount >= 3 ? '91%' : '84%'}
            </p>
          </div>
        </div>
      )}
      
      {columnId === 'applied' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: 0, letterSpacing: '-0.01em' }}>📩 Tracked via Inbox · {lead.appliedDate ? new Date(lead.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Auto-detecting...'}</p>
          {lead.tailoredResume && (
            <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0 }}>📄 Version: {lead.tailoredResume.fileName.replace('.pdf', '').split('_').pop() || 'Master'}</p>
          )}
          {lead.ghostRisk && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 8px', marginTop: 2 }}>
              <p style={{ fontFamily: dm, fontSize: 9, color: '#dc2626', margin: 0, fontWeight: 600 }}>👻 Ghost Risk: {lead.ghostRisk}%</p>
              <p style={{ fontFamily: dm, fontSize: 8, color: '#991b1b', margin: '2px 0 0' }}>Recruiter activity paused. Keep looking elsewhere.</p>
            </div>
          )}
          {/* Smart CRM Nudge Button */}
          {nudge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerNudge && onTriggerNudge(lead, nudge);
              }}
              style={{ marginTop: 'auto', fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', minHeight: 'auto', animation: 'pulse 2s ease-in-out infinite', textAlign: 'center' }}
            >
              {nudge.text}
              <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.02)} }`}</style>
            </button>
          )}
        </div>
      )}
      
      {columnId === 'interviewing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 6, padding: '6px 10px' }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#7c3aed', margin: 0, fontWeight: 700 }}>📅 {lead.interviewRound || 'Round 1'}: {lead.interviewDate ? new Date(lead.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</p>
          </div>
          {lead.tailoredResume && (
            <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0, textDecoration: 'underline', cursor: 'pointer' }}>📄 Sent Asset: {lead.tailoredResume.fileName.replace('.pdf', '').split('_').pop() || 'Master'}</p>
          )}
          {/* Smart CRM Nudge Button */}
          {nudge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerNudge && onTriggerNudge(lead, nudge);
              }}
              style={{ marginTop: 'auto', fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', minHeight: 'auto', animation: 'pulse 2s ease-in-out infinite', textAlign: 'center' }}
            >
              {nudge.text}
              <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.02)} }`}</style>
            </button>
          )}
        </div>
      )}
      
      {columnId === 'offer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '6px 10px' }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#15803d', margin: 0, fontWeight: 700 }}>💰 Offer Received</p>
          </div>
          <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0, textDecoration: 'underline', cursor: 'pointer' }}>📈 View Salary Negotiation Comp Data</p>
        </div>
      )}
    </div>
  );
}



export default function PremiumPipeline({ theme, onLeadSelect, user, college, parentCount, signalAdditions = [] }) {
  const t = theme || { primary: '#2563eb' };
  const [cards, setCards] = useState({
    'OPPORTUNITIES': [],
    'APPLIED': [],
    'INTERVIEWING': [],
    'OFFER 🎉': [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user's actual pipeline data from OpportunityApplication entity
  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const applications = await base44.entities.OpportunityApplication.filter({
          applicant_id: user?.id,
        }, '-created_date', 50);

        const newCards = {
          'OPPORTUNITIES': [],
          'APPLIED': [],
          'INTERVIEWING': [],
          'OFFER 🎉': [],
        };

        (applications || []).forEach(app => {
          const card = {
            id: app.id,
            company: app.opportunity_company || 'Unknown Company',
            role: app.opportunity_title || 'Unknown Role',
            logo: '🏢',
            status: app.status || 'applied',
            appliedDate: app.created_date,
            lastActivityDate: app.created_date,
            source: 'User Added',
            recruiter: '—',
            posted: '—',
          };

          // Map status to column
          if (app.status === 'applied' || app.status === 'in_review') {
            newCards['APPLIED'].push(card);
          } else if (app.status === 'interview') {
            newCards['INTERVIEWING'].push(card);
          } else if (app.status === 'closed') {
            newCards['OFFER 🎉'].push(card);
          } else {
            newCards['OPPORTUNITIES'].push(card);
          }
        });

        setCards(newCards);
      } catch (error) {
        console.error('Failed to load pipeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadPipeline();
    }
  }, [user?.id, signalAdditions]);

  // Merge new signal additions into OPPORTUNITIES (deduplicate by company+role)
  const prevAdditionsRef = React.useRef([]);
  React.useEffect(() => {
    const incoming = signalAdditions.filter(
      a => !prevAdditionsRef.current.some(p => p.company === a.company && p.role === a.role)
    );
    if (incoming.length === 0) return;
    prevAdditionsRef.current = signalAdditions;
    setCards(prev => ({
      ...prev,
      'OPPORTUNITIES': [
        ...prev['OPPORTUNITIES'],
        ...incoming.filter(a => !prev['OPPORTUNITIES'].some(c => c.company === a.company && c.role === a.role)),
      ],
    }));
  }, [signalAdditions]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeCol, setActiveCol] = useState('OPPORTUNITIES');

  const handleLeadOpen = (lead) => {
    setSelectedLead(lead);
    if (onLeadSelect) onLeadSelect(lead);
  };

  const handleTriggerNudge = (lead, nudge) => {
    // Trigger CLiFF chat to generate follow-up script
    window.dispatchEvent(new CustomEvent('cliff:nudge-triggered', {
      detail: {
        lead,
        nudgeType: nudge.type,
        daysStale: nudge.days,
        companyName: lead.company,
        role: lead.role,
      }
    }));
    // Scroll to CLiFF chat
    setTimeout(() => {
      document.getElementById('cliff-chat-panel')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleDeleteCard = async (col, cardIndex) => {
    const cardToDelete = cards[col][cardIndex];
    if (!cardToDelete?.id) {
      setCards(prev => ({
        ...prev,
        [col]: prev[col].filter((_, i) => i !== cardIndex),
      }));
      return;
    }

    try {
      await base44.entities.OpportunityApplication.delete(cardToDelete.id);
      setCards(prev => ({
        ...prev,
        [col]: prev[col].filter((_, i) => i !== cardIndex),
      }));
    } catch (error) {
      console.error('Failed to delete from pipeline:', error);
      alert('❌ Failed to remove from pipeline');
    }
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
            <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0, fontWeight: 600 }}>✅ Unlimited tracking · {cards['OPPORTUNITIES'].length + cards['APPLIED'].length + cards['INTERVIEWING'].length + cards['OFFER 🎉'].length} opportunities tracked</p>
          </div>
        </div>

        {/* Mobile: Tab row */}
        <div className="pipeline-tab-bar" style={{ display: 'none', borderBottom: '1px solid #f3f4f6', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <style>{`
            .pipeline-tab-bar::-webkit-scrollbar { display: none; }
            @media (max-width: 768px) {
              .pipeline-tab-bar { display: flex !important; }
              .pipeline-desktop-grid { display: none !important; }
              .pipeline-mobile-col { display: flex !important; }
            }
          `}</style>
          {COLUMNS.map((col, ci) => {
            const dotColors = ['#3b82f6','#f97316','#8b5cf6','#10b981'];
            return (
              <button
                key={col}
                onClick={() => setActiveCol(col)}
                style={{
                  fontFamily: dm, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  color: activeCol === col ? '#111827' : '#6b7280',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${activeCol === col ? dotColors[ci] : 'transparent'}`,
                  padding: '10px 16px', cursor: 'pointer', minHeight: 'auto',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColors[ci], boxShadow: `0 0 5px ${dotColors[ci]}99` }} />
                {col}
                <span style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 100, padding: '1px 7px' }}>{cards[col]?.length || 0}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile: single active column */}
        <div className="pipeline-mobile-col" style={{ display: 'none', flexDirection: 'column', gap: 10, padding: '14px' }}>
          {cards[activeCol]?.map((item, i) => (
            <LeadCard
              key={i} lead={item}
              columnId={activeCol === 'OPPORTUNITIES' ? 'opportunities' : activeCol === 'APPLIED' ? 'applied' : activeCol === 'INTERVIEWING' ? 'interviewing' : 'offer'}
              onOpen={activeCol === 'OPPORTUNITIES' ? handleLeadOpen : setSelectedCard}
              onDelete={handleDeleteCard} cardIndex={i} columnKey={activeCol}
            />
          ))}
          {newCard.col === activeCol ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input autoFocus value={newCard.text} onChange={e => setNewCard(n => ({ ...n, text: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addCard(activeCol); if (e.key === 'Escape') setNewCard({ col: null, text: '' }); }} placeholder="Company or role name..." style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 10px', outline: 'none', minHeight: 'auto' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => addCard(activeCol)} style={{ flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Add</button>
                <button onClick={() => setNewCard({ col: null, text: '' })} style={{ flex: 1, fontFamily: dm, fontSize: 11, color: '#6b7280', background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewCard({ col: activeCol, text: '' })} style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', background: 'none', border: '1px dashed #e5e7eb', borderRadius: 10, padding: '8px 0', cursor: 'pointer', minHeight: 'auto' }}>+ Add card</button>
          )}
        </div>

        {/* Desktop: 4-column grid */}
        <div className="pipeline-desktop-grid" style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.pipeline-desktop-grid::-webkit-scrollbar { display: none; }`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', gap: 0, minWidth: 720 }}>
            {COLUMNS.map((col, ci) => {
              const dotColors = ['#3b82f6','#f97316','#8b5cf6','#10b981'];
              const glows = ['rgba(59,130,246,0.6)','rgba(249,115,22,0.6)','rgba(139,92,246,0.6)','rgba(16,185,129,0.6)'];
              return (
                <div key={col} style={{ borderRight: ci < 3 ? '1px solid #f3f4f6' : 'none', padding: '14px 14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColors[ci], boxShadow: `0 0 6px ${glows[ci]}` }} />
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col}</p>
                    <span style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 100, padding: '1px 7px', marginLeft: 'auto' }}>{cards[col]?.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 80 }}>
                    {col === 'OPPORTUNITIES'
                      ? cards[col].map((lead, i) => <LeadCard key={i} lead={lead} columnId="opportunities" onOpen={handleLeadOpen} onDelete={handleDeleteCard} cardIndex={i} columnKey={col} />)
                      : cards[col].map((item, i) => (
                          <LeadCard key={i} lead={item} columnId={col === 'APPLIED' ? 'applied' : col === 'INTERVIEWING' ? 'interviewing' : 'offer'} onOpen={setSelectedCard} onTriggerNudge={handleTriggerNudge} onDelete={handleDeleteCard} cardIndex={i} columnKey={col} />
                        ))
                    }
                    {newCard.col === col ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input autoFocus value={newCard.text} onChange={e => setNewCard(n => ({ ...n, text: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addCard(col); if (e.key === 'Escape') setNewCard({ col: null, text: '' }); }} placeholder="Company or role name..." style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 10px', outline: 'none', minHeight: 'auto' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => addCard(col)} style={{ flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Add</button>
                          <button onClick={() => setNewCard({ col: null, text: '' })} style={{ flex: 1, fontFamily: dm, fontSize: 11, color: '#6b7280', background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '6px 0', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setNewCard({ col, text: '' })} style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', background: 'none', border: '1px dashed #e5e7eb', borderRadius: 10, padding: '8px 0', cursor: 'pointer', minHeight: 'auto', transition: 'border-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#bfdbfe'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        + Add card
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}