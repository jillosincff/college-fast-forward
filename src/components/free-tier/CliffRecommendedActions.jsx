import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { Sparkles, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// CLIFF's prioritized next actions + outcome-framed discoveries,
// computed from the student's real pipeline and tailored resumes.
export default function CliffRecommendedActions({ user }) {
  const [actions, setActions] = useState(null);
  const [found, setFound] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
      base44.entities.CliffActivity.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
    ]).then(([pipeline, resumes, activities]) => {
      if (cancelled) return;
      const now = Date.now();
      const daysSince = r => (now - new Date(r.status_date || r.created_date).getTime()) / 86400000;
      const list = [];
      const discoveries = [];

      // 0. Active CLIFF activities — per-pursuit next actions (skip ones the
      // resume-review item below already covers)
      const readyResumeCompany = ((resumes || []).find(r => r.status === 'completed' && !r.downloaded_at)?.company_name || '').toLowerCase();
      const activeActs = (activities || [])
        .filter(a => ['new', 'viewed'].includes(a.status))
        .filter(a => (a.company_name || '').toLowerCase() !== readyResumeCompany)
        .slice(0, 2);
      for (const a of activeActs) {
        list.push({
          text: a.summary ? `${a.title} — ${a.summary}` : a.title,
          cta: 'Open',
          go: () => {
            if (a.action_route === 'workspace' && a.company_name) {
              openCliffWorkspace({ company: a.company_name, role: a.job_title || '' });
            } else if (a.action_route && a.action_route.startsWith('#/')) {
              window.location.hash = a.action_route;
            }
          },
        });
      }

      // 1. Resume CLIFF already tailored, not yet downloaded → review it
      const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at);
      if (readyResume) {
        list.push({ text: `Review the resume CLIFF tailored for the ${readyResume.role_title} role at ${readyResume.company_name}`, cta: 'Review', go: () => { window.location.hash = '#/ResumeTailoring'; } });
      }
      const preparedCount = (resumes || []).filter(r => r.status === 'completed').length;
      if (preparedCount > 0) discoveries.push(`CLIFF prepared ${preparedCount} application${preparedCount === 1 ? '' : 's'} for you`);

      // 2. Outreach with no reply → follow up
      const needsFollowUp = (pipeline || []).filter(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5);
      if (needsFollowUp[0]) {
        const r = needsFollowUp[0];
        list.push({ text: `Follow up with ${r.alumni_name || r.company} — no reply in ${Math.floor(daysSince(r))} days`, cta: 'Follow up', go: () => { window.location.hash = '#/ApplicationTracker'; } });
      }
      if (needsFollowUp.length > 0) discoveries.push(`${needsFollowUp.length} follow-up${needsFollowUp.length === 1 ? ' is' : 's are'} due`);

      // 3. Tracked job not yet prepared → let CLIFF handle it
      const unprepared = (pipeline || []).find(r => ['identified', 'matched'].includes(r.status) && !(resumes || []).some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase()));
      if (unprepared) {
        list.push({ text: `Let CLIFF prepare your ${unprepared.company} application`, cta: 'Prepare', go: () => openCliffWorkspace({ company: unprepared.company, role: unprepared.job_title, jobDescription: unprepared.job_description || '', jobUrl: unprepared.job_url || '', location: unprepared.location || '' }) });
      }

      // 4. Stale applications → check status
      const stale = (pipeline || []).find(r => r.status === 'applied' && daysSince(r) >= 7);
      if (stale) {
        list.push({ text: `Update your ${stale.company} application — did you hear back?`, cta: 'Update', go: () => { window.location.hash = '#/ApplicationTracker'; } });
      }

      // 5. Always: today's matches
      list.push({ text: (pipeline || []).length === 0 ? 'Pick your first job below and let CLIFF handle the prep' : "Check today's new matches CLIFF found for you", cta: 'View', go: () => document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth' }) });
      discoveries.push('New matched jobs are in your feed below');

      setActions(list.slice(0, 5));
      setFound(discoveries.slice(0, 3));
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!actions?.length) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={16} color="#7c3aed" />
        <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>CLIFF's Recommended Actions</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: i < 3 ? 'transparent' : '#f5f3ff', color: '#7c3aed', fontFamily: dm, fontSize: i < 3 ? 16 : 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{['🥇', '🥈', '🥉'][i] || i + 1}</span>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, flex: 1, lineHeight: 1.4 }}>{a.text}</p>
            <button
              onClick={a.go}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {a.cta} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {found.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>CLIFF found these for you</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {found.map((f, i) => (
              <span key={i} style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#5b21b6', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, padding: '6px 14px' }}>✨ {f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}