import { useState, useEffect } from 'react';
import { findWorkspaceConnections } from '@/functions/findWorkspaceConnections';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import SoftWallModal from '@/components/conversion/SoftWallModal';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

function ConnectionRow({ c, onDraft, primary }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: primary ? '#f5f3ff' : '#f8f9fc', border: primary ? '1px solid #ddd6fe' : '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', flexWrap: 'wrap' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0, fontFamily: dm }}>
        {(c.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{c.name}</p>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#6d28d9', background: '#ede9fe', borderRadius: 999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</span>
          {c.source === 'external' && (
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#92400e', background: '#fef3c7', borderRadius: 999, padding: '2px 8px' }}>Found via public search</span>
          )}
        </div>
        {c.role_title && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{c.role_title}</p>}
        <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', margin: '3px 0 0', lineHeight: 1.45 }}>{c.why}</p>
      </div>
      {c.linkedin_url && (
        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, textDecoration: 'none', flexShrink: 0, minHeight: 'auto', minWidth: 'auto', fontFamily: dm }}>in</a>
      )}
      <button
        onClick={() => onDraft(c)}
        style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto', minWidth: 'auto' }}
      >
        ✉️ Draft outreach
      </button>
    </div>
  );
}

// CLIFF's automatic networking-advantage check: own-school parents → school alumni →
// opted-in cross-school helpers → optional external public search. Honest language only.
export default function WorkspaceConnectionsCard({ job, user }) {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showSoftWall, setShowSoftWall] = useState(false);

  const company = job.company || '';
  const role = job.role || job.job_title || '';
  const school = (user?.school_code || '').toUpperCase() || 'your school';

  useEffect(() => {
    let cancelled = false;
    findWorkspaceConnections({ companyName: company, targetRole: role, location: user?.location || user?.preferred_locations?.[0] || '' })
      .then(res => {
        const data = res?.data || res;
        if (cancelled) return;
        if (data?.upgrade_required) { setShowSoftWall(true); }
        else setConnections(data?.connections || []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [company]);

  // External public search (existing agent) as the last tier
  const handleExternalScan = async () => {
    setScanning(true);
    try {
      const res = await scoutCompanyBackdoor({ jobId: company, companyName: company });
      const data = res?.data || res;
      if (data?.upgrade_required) { setShowSoftWall(true); setScanning(false); return; }
      const found = (data?.alumni || []).map(a => ({
        tier: 4, source: 'external', name: a.name, role_title: a.role_title,
        linkedin_url: a.linkedin_url || null, persona: 'alumni',
        why: `${school} alum found via public search — works in a relevant area at ${company}`,
        label: 'Worth contacting',
      }));
      setConnections(prev => {
        const names = new Set(prev.map(c => (c.name || '').toLowerCase()));
        return [...prev, ...found.filter(f => !names.has((f.name || '').toLowerCase()))];
      });
    } catch { /* search failed — student still sees the honest empty state */ }
    setScanning(false);
    setScanned(true);
  };

  const draftOutreach = (c) => {
    window.location.hash = `#/OutreachDrafts?context=alumni_search&company=${encodeURIComponent(company)}&jobTitle=${encodeURIComponent(role)}&alumniName=${encodeURIComponent(c.name || '')}&alumniRole=${encodeURIComponent(c.role_title || '')}&alumniLinkedin=${encodeURIComponent(c.linkedin_url || '')}&skipForm=1`;
  };

  const recommended = connections[0];
  const rest = connections.slice(1);

  return (
    <div style={card}>
      <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        Networking Advantage <span style={{ fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· Optional</span>
      </h3>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed', fontFamily: dm, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          CLIFF is checking your network at {company}…
        </div>
      ) : recommended ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 10px', lineHeight: 1.55 }}>
            CLIFF recommends contacting <strong>{recommended.name}</strong> first. No referral is promised — but a short, respectful message here beats a cold application.
          </p>
          <ConnectionRow c={recommended} onDraft={draftOutreach} primary />
          {rest.length > 0 && !showAll && (
            <button onClick={() => setShowAll(true)} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', minHeight: 'auto', minWidth: 'auto' }}>
              + {rest.length} more possible connection{rest.length === 1 ? '' : 's'}
            </button>
          )}
          {showAll && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {rest.map((c, i) => <ConnectionRow key={i} c={c} onDraft={draftOutreach} />)}
            </div>
          )}
        </>
      ) : scanned ? (
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.55 }}>
          No connections found at {company} right now — a strong tailored application is your best path here. CLIFF will flag this company if a connection joins the network.
        </p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
            No strong connection found yet. You can optionally search public sources for alumni who work here.
          </p>
          <button
            onClick={handleExternalScan}
            disabled={scanning}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, padding: '9px 18px', cursor: scanning ? 'wait' : 'pointer', flexShrink: 0, minHeight: 44, opacity: scanning ? 0.7 : 1 }}
          >
            {scanning ? 'Searching…' : '🔍 Search for Connections'}
          </button>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {showSoftWall && user && <SoftWallModal user={user} onClose={() => setShowSoftWall(false)} source="workspace_connections" />}
    </div>
  );
}