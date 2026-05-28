/**
 * ColdDiscoverySection
 * A visually distinct below-the-fold hub for cold (connectionless) roles.
 * Only rendered when the user has explicitly opted in via the ColdDiscoveryCard.
 * Pulls roles from getFreeTierCompanyRecs (broad, non-network-gated query).
 * Strips any companies already appearing in the warm carousel to prevent overlap.
 */
import { useState, useEffect } from 'react';
import { getFreeTierCompanyRecs } from '@/functions/getFreeTierCompanyRecs';

const dm = "'DM Sans', system-ui, sans-serif";

function ColdRoleCard({ role, onGenerateScript, onAddToPipeline }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToPipeline = (e) => {
    e.stopPropagation();
    onAddToPipeline(role);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fafafa' : '#fff',
        border: '1.5px solid #e5e7eb',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        borderColor: hovered ? '#d1d5db' : '#e5e7eb',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        cursor: 'pointer',
      }}
      onClick={() => window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.company + ' ' + (role.role || ''))}`, '_blank')}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        🏢
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{role.company}</p>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap' }}>
            Cold Role
          </span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>{role.role || 'Open Positions Available'}</p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
          No alumni or parent contact confirmed yet. Click card to view on LinkedIn, or use CLIFF to craft a cold outreach script.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onGenerateScript(role); }}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 700,
            color: '#374151', background: '#f3f4f6', border: '1px solid #e5e7eb',
            borderRadius: 8, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto',
            whiteSpace: 'nowrap', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
        >
          ✉️ Cold Script
        </button>
        <button
          onClick={handleAddToPipeline}
          disabled={added}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 700,
            color: added ? '#fff' : '#fff',
            background: added ? '#16a34a' : '#2563eb',
            border: 'none',
            borderRadius: 8, padding: '7px 12px', cursor: added ? 'default' : 'pointer',
            minHeight: 'auto', whiteSpace: 'nowrap', transition: 'all 0.2s',
            boxShadow: added ? 'none' : '0 2px 6px rgba(37,99,235,0.3)',
          }}
        >
          {added ? '✅ Added' : '📥 Add to Pipeline'}
        </button>
      </div>
    </div>
  );
}

export default function ColdDiscoverySection({ warmCompanyNames = [], onGenerateScript, onDismiss, onAddToPipeline }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFreeTierCompanyRecs({})
      .then(res => {
        const all = res?.data?.companies || res?.data || [];
        // Strip companies already present in the warm carousel
        const warmSet = new Set(warmCompanyNames.map(n => n.toLowerCase().trim()));
        const cold = all
          .filter(c => {
            const name = (c.company || c.name || '').toLowerCase().trim();
            return name && !warmSet.has(name);
          })
          .slice(0, 10)
          .map(c => ({
            company: c.company || c.name,
            role: c.role || c.topRole || null,
          }));
        setRoles(cold);
      })
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: 32, borderTop: '2px dashed #e5e7eb', paddingTop: 28 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
              Cold Discovery — Explore Beyond Your Network
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: 0 }}>
              No alumni or parent contacts confirmed · Standard application or cold outreach required
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 100, padding: '4px 12px' }}>
            Cold Roles Only
          </span>
          <button
            onClick={onDismiss}
            style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', minHeight: 'auto' }}
          >
            Hide
          </button>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          These roles are outside your verified warm network. CLIFF can still help you write a compelling cold outreach script — just click "Cold Script" on any card. But you won't have the alumni backdoor advantage here.
        </p>
      </div>

      {/* Role cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: '#f1f5f9', animation: 'shimmerCold 1.5s infinite linear', backgroundImage: 'linear-gradient(to right, #f1f5f9 4%, #e2e8f0 25%, #f1f5f9 36%)', backgroundSize: '1000px 100%' }} />
          ))}
          <style>{`@keyframes shimmerCold { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }`}</style>
        </div>
      ) : roles.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#94a3b8', margin: 0 }}>No additional cold roles found right now. Check back as the platform expands.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roles.map((role, i) => (
            <ColdRoleCard key={i} role={role} onGenerateScript={onGenerateScript} onAddToPipeline={onAddToPipeline} />
          ))}
        </div>
      )}
    </div>
  );
}