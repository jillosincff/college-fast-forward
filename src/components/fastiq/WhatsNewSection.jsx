import React, { useState } from 'react';
import titleCase from '@/components/utils/titleCase';
import moment from 'moment';

/**
 * SECTION 1 — WHAT'S NEW
 * Only renders when there IS something new (alumni found or opportunities scouted).
 * Shows inline lists — no "view brief" redirects.
 */

function guessDomain(name) {
  const map = { 'amazon': 'amazon.com', 'google': 'google.com', 'meta': 'meta.com', 'apple': 'apple.com', 'microsoft': 'microsoft.com', 'salesforce': 'salesforce.com', 'netflix': 'netflix.com', 'adobe': 'adobe.com', 'spotify': 'spotify.com', 'tesla': 'tesla.com', 'nike': 'nike.com', 'disney': 'disney.com', 'airbnb': 'airbnb.com', 'uber': 'uber.com', 'stripe': 'stripe.com', 'nvidia': 'nvidia.com', 'deloitte': 'deloitte.com', 'jpmorgan': 'jpmorgan.com', 'goldman sachs': 'goldmansachs.com' };
  const lower = (name || '').toLowerCase();
  return map[lower] || `${lower.replace(/[^a-z0-9]/g, '')}.com`;
}

function AlumniRow({ alumni, onOpenChat }) {
  // Build relevance hint from role title and company
  const role = (alumni.role_title || '').toLowerCase();
  const company = titleCase(alumni.company || '');
  let relevanceHint = '';
  if (role.includes('design') || role.includes('creative') || role.includes('art')) relevanceHint = 'Design/creative role';
  else if (role.includes('engineer') || role.includes('developer') || role.includes('software')) relevanceHint = 'Tech/engineering role';
  else if (role.includes('market') || role.includes('brand') || role.includes('growth')) relevanceHint = 'Marketing/growth role';
  else if (role.includes('financ') || role.includes('analyst') || role.includes('account')) relevanceHint = 'Finance/analytics role';
  else if (role.includes('manage') || role.includes('director') || role.includes('lead')) relevanceHint = 'Leadership role';
  else if (role.includes('sales') || role.includes('business dev')) relevanceHint = 'Sales/BD role';
  else if (role.includes('consult')) relevanceHint = 'Consulting role';
  else if (role.includes('product')) relevanceHint = 'Product role';
  else if (role.includes('data') || role.includes('science')) relevanceHint = 'Data/science role';
  else relevanceHint = `${alumni.role_title || 'Professional'} role`;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
      background: '#1A1A1A', borderRadius: 12, border: '1px solid #2A2A2A',
      transition: 'all 0.15s',
    }}>
      <img
        src={`https://logo.clearbit.com/${guessDomain(alumni.company)}`}
        alt=""
        style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, objectFit: 'contain', background: '#2A2A2A', marginTop: 2 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alumni.name}
        </p>
        <p style={{ fontSize: 11, color: '#888', margin: '1px 0 0' }}>
          {alumni.role_title} at {company}
        </p>
        {/* Quick relevance bullets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#E85D20', background: 'rgba(232,93,32,0.1)',
            padding: '2px 8px', borderRadius: 6, lineHeight: '16px',
          }}>💡 {relevanceHint} at {company}</span>
          {alumni.uf_verified === false && alumni.confidence === 'low' ? (
            <span title="School connection unverified — check LinkedIn" style={{
              fontSize: 10, fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.1)',
              padding: '2px 8px', borderRadius: 6, lineHeight: '16px', cursor: 'help',
            }}>⚠️ UF Unverified</span>
          ) : alumni.verified || alumni.uf_verified ? (
            <span title="Confirmed University of Florida graduate/alum" style={{
              fontSize: 10, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.1)',
              padding: '2px 8px', borderRadius: 6, lineHeight: '16px', cursor: 'help',
            }}>✅ UF Alum</span>
          ) : (
            <span title="Likely UF connection — verify on LinkedIn" style={{
              fontSize: 10, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.1)',
              padding: '2px 8px', borderRadius: 6, lineHeight: '16px', cursor: 'help',
            }}>🐊 UF Alum</span>
          )}
          {alumni.match_score >= 70 && alumni.confidence !== 'low' && (
            <span title="Strong fit for your interests + UF connection" style={{
              fontSize: 10, fontWeight: 600, color: '#E85D20', background: 'rgba(232,93,32,0.1)',
              padding: '2px 8px', borderRadius: 6, lineHeight: '16px', cursor: 'help',
            }}>⭐ High match</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 2 }}>
        <button
          onClick={() => onOpenChat(`Tell me about ${alumni.name} at ${alumni.company}`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
        >View Profile →</button>
        <button
          onClick={() => onOpenChat(`Draft a warm intro message to ${alumni.name}, ${alumni.role_title || 'professional'} at ${alumni.company}`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: alumni.uf_verified === false && alumni.confidence === 'low' ? '#94A3B8' : '#0021A5', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
          disabled={alumni.uf_verified === false && alumni.confidence === 'low'}
          title={alumni.uf_verified === false && alumni.confidence === 'low' ? 'Verify UF connection first' : ''}
        >Draft Message →</button>
      </div>
    </div>
  );
}

function OpportunityRow({ opp, onOpenChat, onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0',
    }}>
      <img
        src={`https://logo.clearbit.com/${guessDomain(opp.company_name)}`}
        alt=""
        style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, objectFit: 'contain', background: '#F1F5F9' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {opp.role_title}
        </p>
        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
          {titleCase(opp.company_name)} {opp.scouted_date ? `· Found ${moment(opp.scouted_date).fromNow()}` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onOpenChat(`Research ${opp.company_name} for the ${opp.role_title} role`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#0021A5', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
        >Research →</button>
        <button
          onClick={() => onOpenChat(`Tailor my resume for the ${opp.role_title} role at ${opp.company_name}`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
        >Tailor Resume →</button>
      </div>
    </div>
  );
}

export default function WhatsNewSection({ newAlumni, newOpportunities, onOpenChat, onDismissOpp }) {
  const [showAllAlumni, setShowAllAlumni] = useState(false);
  const [showAllOpps, setShowAllOpps] = useState(false);

  const hasAlumni = newAlumni && newAlumni.length > 0;
  const hasOpps = newOpportunities && newOpportunities.length > 0;

  if (!hasAlumni && !hasOpps) return null;

  const visibleAlumni = showAllAlumni ? newAlumni : newAlumni.slice(0, 5);
  const visibleOpps = showAllOpps ? newOpportunities : newOpportunities.slice(0, 4);

  return (
    <div className="fiq-animate fiq-delay-1" style={{ marginBottom: 28 }}>
      {/* New Alumni */}
      {hasAlumni && (
        <div style={{ marginBottom: hasOpps ? 20 : 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            padding: '10px 14px', background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            borderRadius: 12, border: '1.5px solid #FB923C',
            boxShadow: '0 0 20px rgba(250,70,22,0.12)',
            animation: 'fiq-alumni-glow 2.5s ease-in-out infinite',
          }}>
            <style>{`
              @keyframes fiq-alumni-glow {
                0%, 100% { box-shadow: 0 0 12px rgba(250,70,22,0.10); }
                50% { box-shadow: 0 0 24px rgba(250,70,22,0.22); }
              }
              @keyframes fiq-alumni-dot {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.6); opacity: 0.5; }
              }
            `}</style>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#FA4616', flexShrink: 0,
              animation: 'fiq-alumni-dot 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C2410C' }}>
              {newAlumni.length} new UF {newAlumni.length === 1 ? 'alum' : 'alumni'} found at your target companies
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff',
              background: '#FA4616', padding: '3px 10px', borderRadius: 20, flexShrink: 0,
              letterSpacing: '0.02em',
            }}>NEW</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleAlumni.map((a, i) => (
              <AlumniRow key={a.id || i} alumni={a} onOpenChat={onOpenChat} />
            ))}
          </div>
          {newAlumni.length > 5 && !showAllAlumni && (
            <button
              onClick={() => setShowAllAlumni(true)}
              style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#0021A5', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0' }}
            >
              See all {newAlumni.length} →
            </button>
          )}
        </div>
      )}

      {/* New Opportunities */}
      {hasOpps && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '8px 12px', background: '#FFF7ED', borderRadius: 8, borderLeft: '3px solid #FA4616',
          }}>
            <span style={{ fontSize: 16 }}>💼</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C2410C' }}>
              {newOpportunities.length} new entry-level role{newOpportunities.length > 1 ? 's' : ''} match your profile
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleOpps.map((o, i) => (
              <OpportunityRow key={o.id || i} opp={o} onOpenChat={onOpenChat} onDismiss={onDismissOpp} />
            ))}
          </div>
          {newOpportunities.length > 4 && !showAllOpps && (
            <button
              onClick={() => setShowAllOpps(true)}
              style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#C2410C', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0' }}
            >
              See all {newOpportunities.length} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}