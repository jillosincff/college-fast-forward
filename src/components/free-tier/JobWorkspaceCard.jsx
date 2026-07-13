import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { Briefcase } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const mark = (s) => (['complete', 'approved', 'ready_for_review'].includes(s) ? '✅' : s === 'generating' ? '🟡' : '⬜');

// Sidebar card: everything lives under the job — one row per active pursuit.
export default function JobWorkspaceCard({ user }) {
  const [pursuits, setPursuits] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.JobPursuit.filter({ user_email: user.email }, '-updated_date', 4)
      .then(rows => setPursuits((rows || []).filter(p => !['archived', 'rejected', 'withdrawn'].includes(p.application_status))))
      .catch(() => setPursuits([]));
  }, [user?.email]);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Briefcase size={16} color="#7c3aed" />
        <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Job Workspace</h3>
      </div>

      {pursuits === null && (
        <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: 0 }}>Loading your jobs…</p>
      )}

      {pursuits && pursuits.length === 0 && (
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Pick a job in your feed and tap <strong>"Let CLIFF Handle This"</strong> — your resume, connections, research, and interview prep for that job all live here.
        </p>
      )}

      {pursuits && pursuits.map(p => (
        <button
          key={p.id}
          onClick={() => openCliffWorkspace({ company: p.company_name, role: p.job_title, jobUrl: p.job_url || '', location: p.location || '' })}
          style={{ display: 'block', width: '100%', textAlign: 'left', background: '#f8f9fc', border: '1px solid #eef0f4', borderRadius: 12, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', minHeight: 'auto', transition: 'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#c4b5fd'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#eef0f4'}
        >
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 2px', lineHeight: 1.3 }}>{p.job_title}</p>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 8px' }}>{p.company_name}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            <span style={{ fontFamily: dm, fontSize: 11, color: '#374151' }}>{mark(p.resume_status)} Resume</span>
            <span style={{ fontFamily: dm, fontSize: 11, color: '#374151' }}>{mark(p.connection_search_status)} Connections</span>
            <span style={{ fontFamily: dm, fontSize: 11, color: '#374151' }}>{mark(p.company_research_status)} Research</span>
          </div>
          {p.next_action && (
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6d28d9', margin: '8px 0 0' }}>→ {p.next_action}</p>
          )}
        </button>
      ))}
    </div>
  );
}