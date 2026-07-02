import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { FileText, Download, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';

// Real-data resume hub for the premium sidebar: the student's actual resume
// on file plus their genuine AI-tailored versions from history.
export default function PremiumResumeCard({ user }) {
  const [versions, setVersions] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.TailoredResume
      .filter({ user_email: user.email, status: 'completed' }, '-created_date', 5)
      .then(rows => setVersions(rows || []))
      .catch(() => setVersions([]));
  }, [user?.email]);

  const resumeName = user?.resume_filename || (user?.resume_url ? 'Resume.pdf' : null);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={16} color={INDIGO} />
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Resume Corner</p>
      </div>

      {/* Master resume on file */}
      <div style={{ padding: '14px 18px 0' }}>
        {resumeName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📄</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resumeName}</p>
              <p style={{ fontFamily: dm, fontSize: 10, color: '#16a34a', margin: '2px 0 0', fontWeight: 700 }}>On file</p>
            </div>
            {user?.resume_url && (
              <a href={user.resume_url} target="_blank" rel="noopener noreferrer" aria-label="Download resume" style={{ color: INDIGO, flexShrink: 0, display: 'flex', minHeight: 'auto', minWidth: 'auto' }}>
                <Download size={16} />
              </a>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 12, padding: '11px 14px' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#92400e', margin: 0 }}>No resume on file yet</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#a16207', margin: '3px 0 0', lineHeight: 1.5 }}>Upload one to unlock tailoring and ATS checks.</p>
          </div>
        )}
      </div>

      {/* Tailored versions */}
      <div style={{ padding: '14px 18px 16px' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Tailored Versions</p>
        {versions === null ? (
          <div style={{ height: 44, background: '#f3f4f6', borderRadius: 10, animation: 'resumePulse 1.4s ease-in-out infinite' }}>
            <style>{`@keyframes resumePulse { 0%,100%{opacity:1} 50%{opacity:0.55} }`}</style>
          </div>
        ) : versions.length === 0 ? (
          <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '0 0 12px', lineHeight: 1.5 }}>
            No tailored versions yet — tailor your resume for a specific job to boost your ATS match.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {versions.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #f1f5f9', borderRadius: 10, padding: '9px 12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.company_name}{v.role_title ? ` — ${v.role_title}` : ''}
                  </p>
                  <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>
                    {v.created_date ? format(new Date(v.created_date), 'MMM d') : ''}
                  </p>
                </div>
                {typeof v.ats_score === 'number' && (
                  <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: v.ats_score >= 80 ? '#16a34a' : '#d97706', background: v.ats_score >= 80 ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', borderRadius: 100, padding: '3px 8px', flexShrink: 0 }}>
                    {v.ats_score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('ResumeTailoring')}
          style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${INDIGO}, #7c3aed)`, border: 'none', borderRadius: 999, padding: '11px 0', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Sparkles size={14} /> Tailor for a job →
        </button>
      </div>
    </div>
  );
}