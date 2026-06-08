import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const PREVIEW_LENGTH = 160;

const SIGNAL_MAP = {
  hot:  { label: '🔥 Hot', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  warm: { label: '⚡ Active', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  cool: { label: '✅ Hiring', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

function CompanyCard({ company }) {
  const [expanded, setExpanded] = useState(false);
  const desc = company.hiring_description || '';
  const isLong = desc.length > PREVIEW_LENGTH;
  const signal = SIGNAL_MAP[company.hiring_signal] || SIGNAL_MAP.cool;

  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,40,217,0.10)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
            {company.name}
          </p>
          <p style={{ fontFamily: SF, fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>
            {company.size === 'large' ? 'Large company' : company.size === 'mid' ? 'Mid-size company' : 'Company'} · Entry-level hiring
          </p>
        </div>
        <span style={{
          fontFamily: SF, fontSize: 10, fontWeight: 700, flexShrink: 0,
          background: signal.bg, color: signal.color, border: `1px solid ${signal.border}`,
          borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {signal.label}
        </span>
      </div>

      {/* Description */}
      {desc && (
        <div>
          <p style={{ fontFamily: SF, fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.65 }}>
            {expanded || !isLong ? desc : desc.slice(0, PREVIEW_LENGTH).trimEnd() + '…'}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO,
                background: 'none', border: 'none', padding: '5px 0 0', cursor: 'pointer',
                minHeight: 'auto', minWidth: 'auto', display: 'block',
              }}
            >
              {expanded ? 'Show less ↑' : 'Read more →'}
            </button>
          )}
        </div>
      )}

      {/* Unlock CTA */}
      <div style={{ background: 'rgba(109,40,217,0.05)', border: '1px solid rgba(109,40,217,0.12)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ fontFamily: SF, fontSize: 11, color: INDIGO, fontWeight: 600, margin: 0 }}>
          🔒 Sign up to unlock alumni contacts & get a warm intro inside {company.name}
        </p>
      </div>
    </div>
  );
}

export default function LiveJobsSection({ go }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getLiveJobMatchesFn', {
      industries: ['Technology', 'Finance', 'Marketing', 'Consulting'],
      company_sizes: ['large', 'mid'],
    }).then(res => {
      const list = res?.data?.companies || [];
      setCompanies(list.slice(0, 6));
    }).catch(() => {
      setCompanies([]);
    }).finally(() => setLoading(false));
  }, []);

  if (!loading && companies.length === 0) return null;

  return (
    <div style={{ background: '#f8f9ff', padding: 'clamp(56px,12vw,96px) clamp(20px,5vw,40px)', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 6vw, 40px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 100, padding: '6px 16px', marginBottom: 14 }}>
            <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>🔴 Live Hiring Signal</span>
          </div>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 12px' }}>
            Companies actively hiring right now
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px,3.5vw,16px)', color: '#64748b', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
            CFF scans the market daily. Sign up to see open roles, salary data, and get a warm alumni intro at each company.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 22px', height: 180 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 18, width: '65%', marginBottom: 10 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '40%', marginBottom: 18 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '100%', marginBottom: 6 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '85%', marginBottom: 6 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '70%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {companies.map((c, i) => <CompanyCard key={i} company={c} />)}
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(28px, 6vw, 40px)' }}>
          <p style={{ fontFamily: SF, fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
            Sign up to see full job listings, salary data & unlock warm intros →
          </p>
          <button onClick={go} style={{
            fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 12,
            padding: '14px 36px', cursor: 'pointer', minHeight: 50,
            boxShadow: '0 8px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Unlock All Opportunities →
          </button>
        </div>
      </div>
    </div>
  );
}