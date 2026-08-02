import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import useAccessPlan from '@/hooks/useAccessPlan';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const device = () => (window.innerWidth < 768 ? 'mobile' : 'desktop');

// Done-For-You activation hero — shown once after onboarding. Presents ONE real
// job matching the student's goals as a finished "application package" CLIFF
// already built (tailored resume + drafted note), so the first session ends
// with an approve-and-send moment instead of a to-do list.
export default function FirstApplicationPackageCard({ user }) {
  // Backend eligibility covers the ~1,600 existing students who onboarded
  // before the localStorage flag existed — they have magic_moment_status
  // 'available' but no cff_first_draft_pending flag, so the old gate hid the
  // card from them entirely.
  const { magicMomentAvailable, magicMomentCompleted, loadError, loading: planLoading } = useAccessPlan(user);
  const pendingFlag = (() => { try { return localStorage.getItem('cff_first_draft_pending') === 'true'; } catch { return false; } })();
  // Don't render the package card when the access-plan fetch failed (loadError) —
  // a transient error must not resurrect this card for a student who already
  // completed the Magic Moment, even if a stale localStorage flag lingers.
  const eligible = !planLoading && !loadError && !magicMomentCompleted && (magicMomentAvailable || pendingFlag);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || !eligible) return;
    let cancelled = false;
    // Build goals from onboarding localStorage, falling back to the stored
    // career_goals so existing students (no localStorage flags) still get a
    // real job match instead of an empty query.
    const goals = (() => {
      try {
        const lsRoles = JSON.parse(localStorage.getItem('cff_target_roles') || '[]');
        const lsIndustries = JSON.parse(localStorage.getItem('cff_industries') || '[]');
        const lsLocation = localStorage.getItem('cff_location') || '';
        const lsSeeking = localStorage.getItem('cff_seeking') || '';
        const cg = user?.career_goals || {};
        return {
          role: lsRoles[0] || (cg.target_roles?.[0]) || '',
          industries: lsIndustries.length ? lsIndustries : (cg.target_industries || []),
          locations: [lsLocation || cg.location_preference || ''].filter(Boolean),
          seeking: lsSeeking || cg.seeking || 'both',
        };
      } catch { return {}; }
    })();
    base44.functions.invoke('getLiveJobMatchesFn', { career_goals: goals })
      .then(res => {
        const companies = (res?.data || res)?.companies || [];
        if (!cancelled && companies.length > 0) {
          setJob(companies[0]);
          // Record that the Magic Moment was actually offered (a real job shown),
          // not just eligible. Idempotent via event_key — fires once per student.
          base44.functions.invoke('conversionEngine', {
            action: 'log', event_name: 'magic_moment_offered', once: true,
            trigger: 'first_application_package',
            company_name: companies[0].name,
            job_title: companies[0].job_title,
            device: device(),
          }).catch(() => {});
        }
        // No job available → release the dashboard from focus mode so it isn't empty
        else if (!cancelled) window.dispatchEvent(new CustomEvent('cff:first-package-done'));
      })
      .catch(() => { if (!cancelled) window.dispatchEvent(new CustomEvent('cff:first-package-done')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dismissed, eligible]);

  if (!eligible || dismissed) return null;

  const clear = () => {
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    setDismissed(true);
    window.dispatchEvent(new CustomEvent('cff:first-package-done'));
  };

  const openPackage = () => {
    // "Started" = student clicked to open the package. Logs now (not only after
    // the backend tailoring finishes) so the funnel reflects real intent.
    // Idempotent — tailorResume's later log is deduped by the same event_key.
    base44.functions.invoke('conversionEngine', {
      action: 'log', event_name: 'magic_moment_started', once: true,
      trigger: 'first_application_package',
      company_name: job.name,
      job_title: job.job_title,
      device: device(),
    }).catch(() => {});
    const role = job.job_title.replace(/\s+job at\s+.*$/i, '').trim() || job.job_title;
    try {
      sessionStorage.setItem('cff_apply_tailor_ctx', JSON.stringify({
        company: job.name,
        role,
        jd: job.hiring_description || '',
        jobUrl: job.job_url || '',
        location: job.location || '',
      }));
    } catch {}
    const params = new URLSearchParams({
      company: job.name,
      role,
      jd: job.hiring_description || '',
      job_url: job.job_url || '',
      location: job.location || '',
      from: 'apply_modal',
    });
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  if (planLoading || loading) {
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
  // Some aggregators append "Job at Company in City" to titles — strip it for display
  const cleanTitle = job.job_title.replace(/\s+job at\s+.*$/i, '').trim() || job.job_title;

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
        <strong>{cleanTitle}</strong> at <strong>{job.name}</strong>
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