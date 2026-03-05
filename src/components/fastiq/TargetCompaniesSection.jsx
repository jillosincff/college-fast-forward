import React from 'react';

function guessDomain(companyName) {
  if (!companyName) return null;
  const clean = companyName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  return clean.split(/\s+/).join('') + '.com';
}

function CompanyInitial({ name }) {
  const letter = (name || '?')[0].toUpperCase();
  const colors = ['#0021A5','#FA4616','#8B5CF6','#10B981','#EAB308','#06B6D4'];
  const colorIdx = (name || '').charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8, background: colors[colorIdx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: '#fff',
    }}>{letter}</div>
  );
}

function CompanyRow({ name, intel, alumniCount, onOpenChat, delay }) {
  const domain = guessDomain(name);
  const [logoErr, setLogoErr] = React.useState(false);
  const researched = !!intel;
  const score = intel?.hiring_score || 0;
  const signal = intel?.hiring_signal;

  const signalConfig = {
    hot: { color: '#FA4616', label: 'HOT', bg: 'rgba(250,70,22,0.1)' },
    warm: { color: '#EAB308', label: 'WARM', bg: 'rgba(234,179,8,0.1)' },
    cool: { color: '#06B6D4', label: 'COOL', bg: 'rgba(6,182,212,0.1)' },
  };
  const s = signalConfig[signal] || null;

  return (
    <div className="fiq-animate" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', background: '#fff', borderRadius: 14, marginBottom: 8,
      border: '1px solid #E2E8F0', transition: 'all 0.2s', cursor: 'pointer',
      animationDelay: `${delay}s`,
    }}
    onClick={() => researched
      ? onOpenChat(`Show me the latest intel on ${name}`)
      : onOpenChat(`Research ${name} for me — are they hiring?`)
    }
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0021A5'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,33,165,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          {domain && !logoErr ? (
            <img src={`https://logo.clearbit.com/${domain}`} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} onError={() => setLogoErr(true)} />
          ) : (
            <CompanyInitial name={name} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            {s && (
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 6 }}>
                🔥 {s.label}
              </span>
            )}
            {researched && <span className="fiq-mono" style={{ fontSize: 12, color: '#94A3B8' }}>Score: {score}/100</span>}
            <span style={{ fontSize: 12, color: alumniCount > 0 ? '#10B981' : '#94A3B8' }}>
              {alumniCount > 0 ? `✨ ${alumniCount} alumni found` : researched ? 'No alumni yet' : 'Not researched yet'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: researched ? '#0021A5' : '#FA4616', whiteSpace: 'nowrap' }}>
        {researched ? 'View Intel →' : '⚡ Research →'}
      </div>
    </div>
  );
}

export default function TargetCompaniesSection({ companies, companyIntel, alumniCounts, onOpenChat, onAddTargets }) {
  return (
    <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
        }}>Target Companies</h2>
        <button onClick={onAddTargets} style={{
          background: 'none', border: '1.5px solid #E2E8F0', padding: '6px 14px',
          borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#0021A5',
          cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
        }}>+ Add Company</button>
      </div>
      {companies.length > 0 ? companies.map((c, i) => {
        const key = c.toLowerCase();
        return (
          <CompanyRow
            key={c}
            name={c}
            intel={companyIntel[key] || null}
            alumniCount={alumniCounts[key] || 0}
            onOpenChat={onOpenChat}
            delay={0.8 + i * 0.05}
          />
        );
      }) : (
        <div style={{
          background: '#fff', borderRadius: 14, border: '2px dashed #E2E8F0',
          padding: '32px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 6 }}>No targets yet</div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, maxWidth: 320, margin: '0 auto 16px' }}>
            Tell FASTIQ which companies you're interested in and it will find UF alumni, track hiring signals, and scout opportunities for you.
          </div>
          <button onClick={onAddTargets} style={{
            background: '#0021A5', color: '#fff', border: 'none', padding: '10px 24px',
            borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
          }}>+ Add Target Companies</button>
        </div>
      )}
    </div>
  );
}