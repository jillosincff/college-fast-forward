import { useState, useEffect } from 'react';
import { assessNetworkingValue } from '@/functions/assessNetworkingValue';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

function ContactRow({ c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 14px', flexWrap: 'wrap' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0, fontFamily: dm }}>
        {(c.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{c.name}</p>
        {c.role_title && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{c.role_title}</p>}
        <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', margin: '3px 0 0', lineHeight: 1.45 }}>{c.why}</p>
      </div>
    </div>
  );
}

// "Your Best Advantage" — CLIFF decides whether networking is worth it here.
// The student never searches; CLIFF either deploys networking or honestly says skip it.
export default function BestAdvantageCard({ job, pursuit }) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const company = job.company || '';
  const role = job.role || job.job_title || '';

  useEffect(() => {
    let cancelled = false;
    assessNetworkingValue({ companyName: company, roleTitle: role })
      .then(res => { if (!cancelled) setAssessment(res?.data || res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [company]);

  const useDraft = () => {
    const c = assessment?.best_contact || {};
    if (assessment?.recId) assessNetworkingValue({ action: 'drafted', recId: assessment.recId }).catch(() => {});
    window.location.hash = `#/OutreachDrafts?context=alumni_search&company=${encodeURIComponent(company)}&jobTitle=${encodeURIComponent(role)}&alumniName=${encodeURIComponent(c.name || '')}&alumniRole=${encodeURIComponent(c.role_title || '')}&alumniLinkedin=${encodeURIComponent(c.linkedin_url || '')}&skipForm=1`;
  };

  const value = assessment?.value || 'NONE';
  const resumeReady = ['ready_for_review', 'approved', 'complete'].includes(pursuit?.resume_status || '');

  const linkedinAlumni = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company)}`;

  return (
    <div style={card}>
      <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        People at {company}
      </h3>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed', fontFamily: dm, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          CLIFF is weighing your best edge at {company}…
        </div>
      ) : value === 'HIGH' ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>🔥 Best Path</p>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 12px', lineHeight: 1.55 }}>{assessment.reason}</p>
          {(assessment.sequence || []).map((s, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 600, color: '#4b5563', margin: '0 0 6px' }}>
              <span style={{ color: '#7c3aed', fontWeight: 800 }}>{i + 1}</span>&nbsp;&nbsp;{s}
            </p>
          ))}
          <div style={{ marginTop: 10 }}><ContactRow c={assessment.best_contact} /></div>
          {assessment.draft && (
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setShowDraft(v => !v)} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', minHeight: 'auto', minWidth: 'auto' }}>
                {showDraft ? 'Hide prepared draft ▾' : 'Draft already prepared ▸'}
              </button>
              {showDraft && (
                <div style={{ background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginTop: 6 }}>
                  <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', margin: '0 0 6px' }}>Subject: {assessment.draft.subject}</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 8px', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{assessment.draft.message}</p>
                  <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#7c3aed', margin: 0 }}>⏱ {assessment.draft.timing}</p>
                </div>
              )}
            </div>
          )}
          <button onClick={useDraft} style={{ marginTop: 12, fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, padding: '10px 20px', cursor: 'pointer', minHeight: 44 }}>
            ✉️ Use the Prepared Outreach
          </button>
        </>
      ) : (value === 'MEDIUM' || value === 'LOW') && assessment?.best_contact ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 10px', lineHeight: 1.55 }}>
            Here's someone worth reaching out to at {company}. A short, specific message is always worth sending.
          </p>
          <ContactRow c={assessment.best_contact} />
          <button onClick={useDraft} style={{ marginTop: 10, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 999, padding: '9px 18px', cursor: 'pointer', minHeight: 44 }}>
            ✉️ Copy message
          </button>
        </>
      ) : (
        <>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            No one from your school found yet.
          </p>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.55 }}>
            You can cold apply now — I'll keep looking, and flag it the moment a connection shows up.
          </p>
          <a href={linkedinAlumni} target="_blank" rel="noopener noreferrer" style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
            Search LinkedIn for {company} alumni ↗
          </a>
        </>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}