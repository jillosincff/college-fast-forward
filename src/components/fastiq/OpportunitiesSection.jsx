import React from 'react';
import moment from 'moment';

function guessDomain(companyName) {
  if (!companyName) return null;
  const clean = companyName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const words = clean.split(/\s+/);
  if (words.length === 1) return `${words[0]}.com`;
  // Common patterns
  const name = words.join('');
  return `${name}.com`;
}

function OpportunityCard({ opp, onResearch, onTailor, onDismiss, delay }) {
  const domain = guessDomain(opp.company_name);
  const timeAgo = opp.scouted_date ? moment(opp.scouted_date).fromNow() : 'Recently';
  const [logoError, setLogoError] = React.useState(false);

  return (
    <div className={`fiq-animate`} style={{
      padding: '18px 20px', background: '#fff', borderRadius: 14,
      border: '1px solid rgba(250,70,22,0.12)', borderLeft: '4px solid #FA4616',
      marginBottom: 10, transition: 'all 0.2s', cursor: 'default',
      animationDelay: `${delay}s`,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(250,70,22,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #E2E8F0',
          }}>
            {domain && !logoError ? (
              <img src={`https://logo.clearbit.com/${domain}`} alt=""
                style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={() => setLogoError(true)} />
            ) : (
              <span style={{ fontSize: 20 }}>🏢</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{opp.company_name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#FA4616',
                background: 'rgba(250,70,22,0.08)', padding: '2px 8px', borderRadius: 4,
              }}>NEW</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0021A5', marginBottom: 4 }}>{opp.role_title}</div>
            {opp.match_reason && <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>{opp.match_reason}</div>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>🕐 {timeAgo}</span>
              {opp.alumni_count > 0 && (
                <span style={{ fontSize: 11, color: '#FA4616', fontWeight: 700 }}>✨ {opp.alumni_count} UF alumni here</span>
              )}
              <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Early applicants get noticed first</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => onResearch(opp.company_name)} style={{
            padding: '8px 14px', borderRadius: 10, border: 'none', background: '#0021A5',
            color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
          }}>Research →</button>
          <button onClick={() => onTailor(opp)} style={{
            padding: '8px 14px', borderRadius: 10, border: '1.5px solid #8B5CF6',
            background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
          }}>Tailor Resume →</button>
          <button onClick={() => onDismiss(opp.id)} style={{
            padding: '8px 10px', borderRadius: 10, border: '1.5px solid #E2E8F0',
            background: 'transparent', color: '#94A3B8', fontSize: 12, cursor: 'pointer', minHeight: 'auto',
          }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesSection({ opportunities, onOpenChat, onDismiss }) {
  const lastScouted = opportunities[0]?.scouted_date;
  const timeAgo = lastScouted ? moment(lastScouted).fromNow() : 'recently';

  return (
    <div className="fiq-animate fiq-delay-3" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: 'rgba(250,70,22,0.1)', color: '#FA4616',
            width: 32, height: 32, borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🔔</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0 }}>
            FASTIQ found {opportunities.length} new opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          </h2>
          <span style={{
            background: '#FA4616', color: '#fff', fontSize: 10,
            fontWeight: 800, padding: '3px 8px', borderRadius: 6,
          }}>NEW</span>
        </div>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Updated {timeAgo}</span>
      </div>
      {opportunities.map((opp, i) => (
        <OpportunityCard
          key={opp.id}
          opp={opp}
          onResearch={(company) => onOpenChat(`Research ${company} for me — are they hiring?`)}
          onTailor={(o) => onOpenChat(`Tailor my resume for ${o.role_title} at ${o.company_name}`)}
          onDismiss={onDismiss}
          delay={0.4 + i * 0.1}
        />
      ))}
    </div>
  );
}