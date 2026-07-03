import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Done-For-You activation hero — shown once after onboarding. Presents ONE real
// job matching the student's goals as a finished "application package" CLIFF
// already built (tailored resume + drafted note), so the first session ends
// with an approve-and-send moment instead of a to-do list.
export default function FirstApplicationPackageCard({ user }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('cff_first_draft_pending') !== 'true'; } catch { return true; }
  });

  useEffect(() => {
    if (dismissed) return;
    let cancelled = false;
    // Build goals from onboarding data (user.career_goals may not be set yet)
    const goals = (() => {
      try {
        return {
          role: JSON.parse(localStorage.getItem('cff_target_roles') || '[]')[0] || '',
          industries: JSON.parse(localStorage.getItem('cff_industries') || '[]'),
          locations: [localStorage.getItem('cff_location') || ''].filter(Boolean),
          seeking: localStorage.getItem('cff_seeking') || 'both',
        };
      } catch { return {}; }
    })();
    base44.functions.invoke('getLiveJobMatchesFn', { career_goals: goals })
      .then(res => {
        const companies = (res?.data || res)?.companies || [];
        if (!cancelled && companies.length > 0) setJob(companies[0]);
        // No job available → release the dashboard from focus mode so it isn't empty
        else if (!cancelled) window.dispatchEvent(new CustomEvent('cff:first-package-done'));
      })
      .catch(() => { if (!cancelled) window.dispatchEvent(new CustomEvent('cff:first-package-done')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dismissed]);

  if (dismissed) return null;

  const clear = () => {
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    setDismissed(true);
    window.dispatchEvent(new CustomEvent('cff:first-package-done'));
  };

  const openPackage = () => {
    try {
      sessionStorage.setItem('cff_apply_tailor_ctx', JSON.stringify({
        company: job.name,
        role: job.job_title,
        jd: job.hiring_description || '',
        jobUrl: job.job_url || '',
        location: job.location || '',
      }));
    } catch {}
    const params = new URLSearchParams({
      company: job.name,
      role: job.job_title,
      jd: job.hiring_description || '',
      job_url: job.job_url || '',
      location: job.location || '',
      from: 'apply_modal',
    });
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 60%)', border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '18px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 18, height: 18, border: '2.5px solid #ddd6fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#5b21b6', margin: 0 }}>
          CLIFF is finishing your first application package…
        </p>
      </div>
    );
  }

  if (!job) return null;

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ede9fe 0%, #fff 55%)',
      border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '20px 22px',
      marginBottom: 16, boxShadow: '0 4px 20px rgba(124,58,237,0.12)', position: 'relative',
    }}>
      <button onClick={clear} aria-label="Dismiss" style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#9ca3af', fontSize: 16, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, width: 'auto' }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Sparkles size={13} color="#7c3aed" />
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Your first application package is ready
        </span>
      </div>

      <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px', lineHeight: 1.35 }}>
        {firstName}, while you were signing up, CLIFF built this for you:
      </p>
      <p style={{ fontFamily: dm, fontSize: 14, color: '#374151', margin: '0 0 14px' }}>
        <strong>{job.job_title}</strong> at <strong>{job.name}</strong>
        {job.location ? <span style={{ color: '#6b7280' }}> · {job.location}</span> : null}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {[
          'Real opening matched to your goals',
          'Resume tailored to this role\u2019s keywords',
          'Intro note drafted — just approve it',
        ].map((line) => (
          <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: dm, fontSize: 12.5, color: '#374151' }}>{line}</span>
          </div>
        ))}
      </div>

      <button
        onClick={openPackage}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none',
          borderRadius: 999, padding: '14px 24px', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
        }}
      >
        Review my package & send <ArrowRight size={15} />
      </button>
      <p style={{ fontFamily: dm, fontSize: 10.5, color: '#8b5cf6', textAlign: 'center', margin: '8px 0 0' }}>
        Takes about 60 seconds — CLIFF did the heavy lifting.
      </p>
    </div>
  );
}