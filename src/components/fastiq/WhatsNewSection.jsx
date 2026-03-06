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
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0',
      transition: 'all 0.15s',
    }}>
      <img
        src={`https://logo.clearbit.com/${guessDomain(alumni.company)}`}
        alt=""
        style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, objectFit: 'contain', background: '#F1F5F9' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alumni.name}
        </p>
        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
          {alumni.role_title} at {titleCase(alumni.company)}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onOpenChat(`Tell me about ${alumni.name} at ${alumni.company}`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
        >View Profile →</button>
        <button
          onClick={() => onOpenChat(`Draft a message to ${alumni.name} at ${alumni.company}`)}
          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#0021A5', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
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
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '8px 12px', background: '#EFF6FF', borderRadius: 8, borderLeft: '3px solid #0021A5',
          }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0021A5' }}>
              {newAlumni.length} new UF alumni found at your target companies
            </span>
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