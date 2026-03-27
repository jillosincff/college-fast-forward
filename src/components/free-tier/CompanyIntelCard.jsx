import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { base44 } from '@/api/base44Client';
import { formatDisplayName } from '@/lib/formatDisplayName';

const SIGNAL_CONFIG = {
  active:    { label: 'Actively Hiring', color: '#22C55E', bg: '#F0FDF4' },
  selective: { label: 'Selective',       color: '#F59E0B', bg: '#FFFBEB' },
  freeze:    { label: 'Hiring Freeze',   color: '#EF4444', bg: '#FEF2F2' },
  unknown:   { label: 'Status Unknown',  color: '#9CA3AF', bg: '#F9FAFB' },
};

const displayName = (p) => {
  if (!p?.full_name) return 'CFF Member';
  const name = formatDisplayName(p.full_name, { fallback: 'CFF Member' });
  // Guard against username-style values (e.g. 'gosinoff')
  if (!name.includes(' ') && name === name.toLowerCase() && name.length < 20 && !name.includes('.')) return 'CFF Member';
  return name;
};

const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^[-•]\s/gm, '')
    .trim();
};

function HiringSignal({ signal }) {
  const c = SIGNAL_CONFIG[signal] || SIGNAL_CONFIG.unknown;
  return (
    <span style={{
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}30`,
      borderRadius: 100, padding: '3px 10px',
      fontSize: 12, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      ● {c.label}
    </span>
  );
}

function generateDraft(user, parent, companyName) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const goals = user?.career_goals || {};
  const major = user?.major || goals?.major || 'my field';
  const role = (goals?.target_roles || [])[0] || 'roles';
  const industry = (goals?.target_industries || [])[0] || 'the industry';
  const parentFirst = (parent.full_name || 'there').split(' ')[0];
  return `Hi ${parentFirst},

I'm ${user?.full_name || firstName}, a student at UF studying ${major} and targeting ${role} roles in ${industry}. I came across your profile on CFF and noticed your connection to ${companyName} — I'd love to ask you a few quick questions about breaking into the industry.

Would you be open to a brief call or email exchange?

Thank you!
${user?.full_name || firstName}`;
}

function CFFParentsModal({ company, user, onClose }) {
  const parents = company.cff_parents || [];
  const [view, setView] = useState('list');
  const [selectedParent, setSelectedParent] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleContact = (parent) => {
    setSelectedParent(parent);
    setDraft(generateDraft(user, parent, company.name));
    setView('contact');
    setSent(false);
  };

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        sender_email: user?.email,
        sender_name: user?.full_name,
        recipient_email: selectedParent.email,
        subject: `CFF Introduction Request — ${company.name}`,
        body: draft,
        message_type: 'directory_initial',
        is_read: false,
      });
      setSent(true);
      const el = document.createElement('div');
      el.textContent = `Message sent to ${selectedParent.full_name?.split(' ')[0]} ⚡`;
      el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:999999;pointer-events:none;';
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); onClose(); }, 2000);
    } catch (e) {
      console.error('Send failed:', e);
    }
    setSending(false);
  };

  const parentTitle = (p) => {
    const title = p.job_title || p.current_role || '';
    const co = p.company || p.current_company || company.name;
    if (title) return `${title}${co ? ` · ${co}` : ''}`;
    return 'CFF Parent';
  };

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 4px' }}>CFF NETWORK</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#0d1117', margin: 0 }}>Parents at {company.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa', minHeight: 'auto', padding: 4, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {view === 'list' ? (
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parents.length === 0 ? (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>No CFF parents found at this company.</p>
              ) : parents.map((p, i) => (
                <div key={i} style={{ background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {(p.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{displayName(p)}</p>
                      {(p.job_title || p.company) && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '2px 0 0' }}>
                          {p.job_title}{p.job_title && p.company ? ' · ' : ''}{p.company}
                        </p>
                      )}
                      {p.school && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', margin: '1px 0 0' }}>CFF Parent · {p.school}</p>}
                      {p.linkedin_url && (
                        <button
                          onClick={e => { e.stopPropagation(); const url = p.linkedin_url.startsWith('http') ? p.linkedin_url : `https://${p.linkedin_url}`; window.open(url, '_blank', 'noopener,noreferrer'); }}
                          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#0077B5', margin: '2px 0 0', display: 'inline-block', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                        >View LinkedIn →</button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', fontWeight: 500, margin: 0 }}>
                    {['happy_to_help','yes','open','actively_helping'].includes(p.intro_availability) ? '✓ Open to intro requests' : '✓ CFF Member'}
                  </p>
                  <button onClick={() => handleContact(p)} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                    Contact Now →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {(selectedParent?.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{displayName(selectedParent || {})}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#888', margin: 0 }}>{parentTitle(selectedParent)}</p>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FastIQ drafted this for you:</p>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={10}
                  style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 10, padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#333', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
              </div>
              {sent ? (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#22C55E', fontWeight: 600, textAlign: 'center', margin: 0 }}>✓ Message sent!</p>
              ) : (
                <button onClick={handleSend} disabled={sending}
                  style={{ background: sending ? '#ccc' : '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: sending ? 'default' : 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                  {sending ? 'Sending...' : 'Send Message →'}
                </button>
              )}
              <button onClick={() => setView('list')}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', minHeight: 'auto', padding: 0, fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                ← Back to profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CompanyIntelCard({ company, isFastIQ, onUpgrade, onResearch, savedCompanies, onSave, onUnsave, user, onUnlockFastIQ, onViewAlumni }) {
  const [expanded, setExpanded] = useState(false);
  const [showParentsModal, setShowParentsModal] = useState(false);
  const isSaved = savedCompanies?.includes(company.name);

  const signal = company.hiring_signal || 'unknown';
  const isBest = company.is_combo;
  const isActive = signal === 'active';
  const isCollapsed = !isBest && !isActive && !expanded;

  const knownFor = cleanText(company.known_for);
  const whatTheyLookFor = (company.what_they_look_for || []).map(cleanText).slice(0, 3);
  const timeline = cleanText(company.application_timeline);

  let cardStyle = {};
  if (isBest) {
    cardStyle = { border: '2px solid #E85D20', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(232,93,32,0.1)', marginBottom: 16, position: 'relative' };
  } else if (isActive) {
    cardStyle = { border: '1px solid #e5e5e5', background: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, position: 'relative' };
  } else {
    cardStyle = { border: '1px solid #f0f0f0', background: '#fafafa', padding: 16, borderRadius: 12, marginBottom: 10, cursor: isCollapsed ? 'pointer' : 'default', position: 'relative' };
  }

  return (
    <>
      {showParentsModal && <CFFParentsModal company={company} user={user} onClose={() => setShowParentsModal(false)} />}
      <div style={cardStyle} onClick={isCollapsed ? () => setExpanded(true) : undefined}>
        {isBest && (
          <div style={{ position: 'absolute', top: -12, left: 16, background: '#E85D20', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
            ⭐ Best Opportunity
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: isBest ? 8 : 0 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: isBest ? 20 : 17, fontWeight: 600, color: '#0d1117', margin: '0 0 2px' }}>{company.name}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{company.industry}{company.headquarters ? ` · ${company.headquarters}` : ''}</p>
          </div>
          <HiringSignal signal={signal} />
        </div>

        {/* Real Signals from Firecrawl enrichment */}
        {!isCollapsed && company.signals && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {company.signals.open_roles?.count > 0 && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: '#F0FDF4', color: '#22C55E', border: '1px solid #86EFAC', borderRadius: 100, padding: '4px 10px', fontWeight: 500 }}>
                {company.signals.open_roles.count} open role{company.signals.open_roles.count !== 1 ? 's' : ''}
              </span>
            )}
            {company.signals.growth_signal?.detected && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: '#EFF6FF', color: '#3B82F6', border: '1px solid #93C5FD', borderRadius: 100, padding: '4px 10px', fontWeight: 500 }}>
                💰 {company.signals.growth_signal.summary}
              </span>
            )}
            {company.signals.layoff_alert?.detected && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 100, padding: '4px 10px', fontWeight: 500 }}>
                ⚠ {company.signals.layoff_alert.summary}
              </span>
            )}
            {company.signals.hiring_timeline_note && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: '#FFFBEB', color: '#D97706', border: '1px solid #FCD34D', borderRadius: 100, padding: '4px 10px', fontWeight: 500 }}>
                📋 {company.signals.hiring_timeline_note}
              </span>
            )}
          </div>
        )}

        {/* Matched roles for this student */}
        {!isCollapsed && company.signals?.open_roles?.matched_roles?.length > 0 && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: '8px 0 0', fontWeight: 500 }}>
            Roles matching your profile: <strong>{company.signals.open_roles.matched_roles.join(' · ')}</strong>
          </p>
        )}

        {isCollapsed ? (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {company.cff_parent_count > 0 && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}>👥 {company.cff_parent_count}</span>
              )}
              {company.alumni_count > 0 && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}>🎓 ~{company.alumni_count}</span>
              )}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa' }}>Tap to expand →</span>
          </div>
        ) : (
          <>
            {knownFor && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: '12px 0 0', lineHeight: 1.5 }}>{knownFor}</p>
            )}
            {/* Use Firecrawl timeline if available, otherwise fall back to LLM */}
            {(company.signals?.hiring_timeline_note || timeline) && !company.signals?.hiring_timeline_note && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '4px 0 0', fontStyle: 'italic' }}>📅 {timeline}</p>
            )}
            {whatTheyLookFor.length > 0 && (
              <div style={{ margin: '12px 0 0' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bbb', margin: '0 0 6px' }}>WHAT THEY LOOK FOR</p>
                {whatTheyLookFor.map((item, i) => (
                  <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: '0 0 3px', paddingLeft: 12, position: 'relative', lineHeight: 1.4 }}>
                    <span style={{ position: 'absolute', left: 0, color: '#E85D20' }}>·</span>{item}
                  </p>
                ))}
              </div>
            )}

            {/* Alumni teaser */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f5f5f5' }}>
              {isFastIQ ? (
                company.alumni_count > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#22C55E', fontWeight: 500, margin: 0 }}>
                      🎓 ~{company.alumni_count} {user?.school || 'UF'} alumni work here
                    </p>
                    <button onClick={() => setShowParentsModal(true)}
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, whiteSpace: 'nowrap' }}>
                      See who →
                    </button>
                  </div>
                ) : null
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
                    🔒 See if any {user?.school || 'UF'} alumni work at {company.name}
                  </p>
                  <button onClick={() => onUnlockFastIQ?.()}
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#fff', fontWeight: 600, background: '#E85D20', border: 'none', borderRadius: 100, padding: '5px 12px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}>
                    Unlock FastIQ →
                  </button>
                </div>
              )}
            </div>

            {/* Research + Save buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onResearch?.(company)}
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'none', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { e.target.style.background = '#E85D20'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#E85D20'; }}
              >
                Research This Company →
              </button>
              <button
                onClick={() => isSaved ? onUnsave?.(company.name) : onSave?.(company.name)}
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'none', border: 'none', color: isSaved ? '#E85D20' : '#888', fontSize: 13, cursor: 'pointer', padding: '7px 10px', minHeight: 'auto', transition: 'color 0.15s ease' }}
              >
                {isSaved ? '🔖 Saved' : '🔖 Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}