import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { Target, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Today's Mission: CLIFF picks exactly 3 things to do today.
// Tasks are generated once per day from real data; completion persists locally.
export default function TodaysMission({ user }) {
  const [mission, setMission] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `cliff_mission_${user?.email}_${today}`;

  useEffect(() => {
    if (!user?.email) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.tasks?.length) { setMission(saved); return; }
    } catch {}

    let cancelled = false;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
    ]).then(([pipeline, resumes]) => {
      if (cancelled) return;
      const daysSince = r => (Date.now() - new Date(r.status_date || r.created_date).getTime()) / 86400000;
      const tasks = [];

      const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at);
      if (readyResume) tasks.push({ text: `Review your ${readyResume.company_name} resume`, time: '2 min', route: '#/ResumeTailoring' });

      const followUp = (pipeline || []).find(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5);
      if (followUp) tasks.push({ text: `Send a follow-up to ${followUp.alumni_name || followUp.company}`, time: '30 sec', route: '#/ApplicationTracker' });

      const unprepared = (pipeline || []).find(r => ['identified', 'matched'].includes(r.status) && !(resumes || []).some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase()));
      if (unprepared) tasks.push({ text: `Kick off your ${unprepared.company} application with me`, time: '5 min', route: 'workspace', company: unprepared.company, role: unprepared.job_title || '' });

      const interviewing = (pipeline || []).find(r => r.status === 'interview');
      if (tasks.length < 3 && interviewing) tasks.push({ text: `Practice for your ${interviewing.company} interview`, time: '5 min', route: '#/MockInterview' });

      const stale = (pipeline || []).find(r => r.status === 'applied' && daysSince(r) >= 7);
      if (tasks.length < 3 && stale) tasks.push({ text: `Update me on your ${stale.company} application`, time: '1 min', route: '#/ApplicationTracker' });

      if (tasks.length < 3) tasks.push({ text: "Pick one job from today's matches", time: '3 min', route: 'feed' });

      const m = { tasks: tasks.slice(0, 3), done: tasks.slice(0, 3).map(() => false) };
      try { localStorage.setItem(storageKey, JSON.stringify(m)); } catch {}
      setMission(m);
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!mission?.tasks?.length) return null;

  const toggle = (i) => {
    const next = { ...mission, done: mission.done.map((d, j) => (j === i ? !d : d)) };
    setMission(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  const go = (t) => {
    if (t.route === 'workspace') openCliffWorkspace({ company: t.company, role: t.role });
    else if (t.route === 'feed') document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth' });
    else if (t.route?.startsWith('#/')) window.location.hash = t.route;
  };

  const doneCount = mission.done.filter(Boolean).length;
  const complete = doneCount === mission.tasks.length;

  return (
    <div style={{ background: '#fff', border: complete ? '1px solid #a7f3d0' : '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="#7c3aed" />
          <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Today's Mission</h3>
        </div>
        <span style={{ fontFamily: dm, fontSize: 15, letterSpacing: 2 }}>
          {mission.done.map((d, i) => <span key={i}>{d ? '✅' : '⬜'}</span>)}
        </span>
      </div>

      {complete ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 22, margin: '0 0 6px' }}>🎉</p>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#065f46', margin: '0 0 4px' }}>Mission complete. Great work.</p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#047857', margin: 0 }}>You did more today than most students do all week. I'll have a fresh mission ready tomorrow.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mission.tasks.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: mission.done[i] ? '#f0fdf4' : '#f8f9fc', borderRadius: 10, padding: '10px 14px' }}>
              <button
                onClick={() => toggle(i)}
                aria-label={mission.done[i] ? 'Mark not done' : 'Mark done'}
                style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', lineHeight: 1, flexShrink: 0 }}
              >
                {mission.done[i] ? '✅' : '⬜'}
              </button>
              <p style={{ fontFamily: dm, fontSize: 13, color: mission.done[i] ? '#9ca3af' : '#374151', textDecoration: mission.done[i] ? 'line-through' : 'none', margin: 0, flex: 1, lineHeight: 1.4 }}>
                {t.text} <span style={{ color: '#9ca3af', fontSize: 11 }}>({t.time})</span>
              </p>
              {!mission.done[i] && (
                <button
                  onClick={() => go(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Go <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}