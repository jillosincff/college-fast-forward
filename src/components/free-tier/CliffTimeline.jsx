import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One timeline. The student never asks "what should I do next?" — CLIFF has
// already decided and lined it up: Today → Tomorrow → later. Every item is a
// single decided move with one button, no matter which capability produced it.

const dayLabel = (date) => {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

export default function CliffTimeline({ user }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
      base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1).catch(() => []),
    ]).then(([pipeline, resumes, plans]) => {
      if (cancelled) return;
      const now = Date.now();
      const daysSince = r => (now - new Date(r.status_date || r.created_date).getTime()) / 86400000;
      const list = [];

      // 🎉 Wins first — celebrate before directing
      const win = (pipeline || []).find(r => ['replied', 'interview', 'offer'].includes(r.status) && daysSince(r) < 3);
      if (win) {
        const msg = win.status === 'offer' ? `Congratulations — you got an offer from ${win.company}!`
          : win.status === 'interview' ? `Congratulations — you landed an interview with ${win.company}!`
          : `${win.alumni_name || win.company} replied — momentum!`;
        list.push({ emoji: '🎉', date: new Date(), text: msg, cta: 'View', go: () => { window.location.hash = '#/ApplicationTracker'; } });
      }

      // 🔥 Today: the one application move CLIFF picked
      const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at);
      const unprepared = (pipeline || []).find(r => ['identified', 'matched'].includes(r.status) && !(resumes || []).some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase()));
      const topOpp = plans?.[0]?.opportunities?.[0];
      if (readyResume) {
        list.push({ emoji: '🔥', date: new Date(), text: `Apply to ${readyResume.company_name} — your tailored resume is ready`, cta: 'Continue', go: () => { window.location.hash = '#/ResumeTailoring'; } });
      } else if (unprepared) {
        list.push({ emoji: '🔥', date: new Date(), text: `Apply to ${unprepared.company} — I'll prep everything`, cta: 'Continue', go: () => openCliffWorkspace({ company: unprepared.company, role: unprepared.job_title, jobDescription: unprepared.job_description || '', jobUrl: unprepared.job_url || '', location: unprepared.location || '' }) });
      } else if (topOpp) {
        list.push({ emoji: '🔥', date: new Date(), text: `Apply to ${topOpp.company} — my top pick for your goal`, cta: 'Continue', go: () => openCliffWorkspace({ company: topOpp.company, role: topOpp.role, jobUrl: topOpp.url || '', location: topOpp.location || '' }) });
      }

      // ⏰ Follow-ups on their due dates
      const followUps = (pipeline || []).filter(r => ['reached_out', 'messaged'].includes(r.status));
      for (const r of followUps.slice(0, 2)) {
        const due = new Date(new Date(r.status_date || r.created_date).getTime() + 5 * 86400000);
        list.push({ emoji: '⏰', date: due < new Date() ? new Date() : due, text: `Follow up with ${r.alumni_name || r.company}`, cta: 'Follow up', go: () => { window.location.hash = '#/ApplicationTracker'; } });
      }

      // ⏰ Stale applications → status check tomorrow
      const stale = (pipeline || []).find(r => r.status === 'applied' && daysSince(r) >= 7);
      if (stale) {
        list.push({ emoji: '⏰', date: addDays(1), text: `Check in on your ${stale.company} application`, cta: 'Update', go: () => { window.location.hash = '#/ApplicationTracker'; } });
      }

      // 🎤 Interview prep before any scheduled interview
      const interviewing = (pipeline || []).find(r => r.status === 'interview');
      if (interviewing) {
        const iDate = interviewing.interview_date ? new Date(interviewing.interview_date) : addDays(2);
        const prepDate = new Date(iDate.getTime() - 86400000);
        list.push({ emoji: '🎤', date: prepDate < new Date() ? new Date() : prepDate, text: `Practice interview for ${interviewing.company}`, cta: 'Practice', go: () => { window.location.hash = '#/MockInterview'; } });
      }

      list.sort((a, b) => a.date - b.date);
      setItems(list.slice(0, 5));
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!items?.length) return null;

  // Group by day label, preserving order
  const groups = [];
  for (const item of items) {
    const label = dayLabel(item.date);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>Your plan — I've already lined it up</h3>
      {groups.map((g, gi) => (
        <div key={g.label} style={{ display: 'flex', gap: 14 }}>
          {/* Timeline rail */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: gi === 0 ? '#7c3aed' : '#d1d5db', marginTop: 5, flexShrink: 0 }} />
            {gi < groups.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', margin: '4px 0' }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: gi < groups.length - 1 ? 16 : 0, minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: gi === 0 ? '#7c3aed' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{g.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: gi === 0 ? '#faf9ff' : '#f8f9fc', border: gi === 0 ? '1px solid #ede9fe' : '1px solid transparent', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0, flex: 1, lineHeight: 1.4 }}>{a.text}</p>
                  <button onClick={a.go}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 800, color: gi === 0 ? '#fff' : '#6d28d9', background: gi === 0 ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#f5f3ff', border: 'none', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {a.cta} <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}