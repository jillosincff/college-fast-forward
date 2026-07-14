import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { runCliffDiscovery } from '@/functions/runCliffDiscovery';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import MissionDraftModal from './MissionDraftModal';
import { Target, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const MEDALS = ['🥇', '🥈', '🥉'];

// The ONE place CLIFF speaks: discoveries, follow-ups, resume reviews, and prep
// all merge into a single ranked mission. Discoveries take the top slot.
export default function TodaysMission({ user }) {
  const [mission, setMission] = useState(null);
  const [draftTask, setDraftTask] = useState(null); // opens the follow-up draft in place
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `cliff_mission_v2_${user?.email}_${today}`;

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
      runCliffDiscovery({}).catch(() => null),
    ]).then(([pipeline, resumes, discRes]) => {
      if (cancelled) return;
      const discoveries = (discRes?.data || discRes)?.discoveries || [];
      const daysSince = r => (Date.now() - new Date(r.status_date || r.created_date).getTime()) / 86400000;
      const pipelineFor = (company) => (pipeline || []).find(r => (r.company || '').toLowerCase() === (company || '').toLowerCase());

      const tasks = [];
      const add = (t) => {
        if (tasks.length >= 3) return;
        if (tasks.some(x => x.kind === t.kind && (x.company || '').toLowerCase() === (t.company || '').toLowerCase())) return;
        tasks.push(t);
      };

      // 1. Discoveries first — a discovery IS Mission #1
      for (const d of discoveries) {
        if (d.discovery_type === 'follow_up') {
          const row = pipelineFor(d.company_name);
          add({ kind: 'followup', text: `Send a follow-up to ${d.company_name}`, time: '30 sec', company: d.company_name, role: row?.job_title || '', contactName: row?.alumni_name || '', pipelineId: row?.id || '', followUpCount: row?.follow_up_count || 0, discoveryId: d.id });
        } else if (d.discovery_type === 'interview_prep') {
          add({ kind: 'interview', text: `Practice for your ${d.company_name} interview`, time: '5 min', route: '#/MockInterview', company: d.company_name, discoveryId: d.id });
        } else {
          add({ kind: 'job', text: d.headline, time: '2 min', route: 'workspace', company: d.company_name, role: d.job_title || '', jobUrl: d.job_url || '', discoveryId: d.id });
        }
      }

      // 2. Everything else CLIFF used to say in separate widgets
      const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at);
      if (readyResume) add({ kind: 'resume', text: `Review your ${readyResume.company_name} resume`, time: '2 min', route: '#/ResumeTailoring', company: readyResume.company_name });

      const outreachDue = (pipeline || []).find(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5);
      if (outreachDue) add({ kind: 'followup', text: `Send a follow-up to ${outreachDue.alumni_name || outreachDue.company}`, time: '30 sec', company: outreachDue.company, role: outreachDue.job_title || '', contactName: outreachDue.alumni_name || '', pipelineId: outreachDue.id, followUpCount: outreachDue.follow_up_count || 0 });

      const interviewing = (pipeline || []).find(r => r.status === 'interview');
      if (interviewing) add({ kind: 'interview', text: `Practice for your ${interviewing.company} interview`, time: '5 min', route: '#/MockInterview', company: interviewing.company });

      const unprepared = (pipeline || []).find(r => ['identified', 'matched'].includes(r.status) && !(resumes || []).some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase()));
      if (unprepared) add({ kind: 'job', text: `Kick off your ${unprepared.company} application with me`, time: '5 min', route: 'workspace', company: unprepared.company, role: unprepared.job_title || '' });

      const staleApplied = (pipeline || []).find(r => r.status === 'applied' && daysSince(r) >= 7);
      if (staleApplied) add({ kind: 'followup', text: `Send a follow-up to ${staleApplied.company}`, time: '30 sec', company: staleApplied.company, role: staleApplied.job_title || '', pipelineId: staleApplied.id, followUpCount: staleApplied.follow_up_count || 0 });

      if (tasks.length < 3) add({ kind: 'feed', text: "Pick one job from today's matches", time: '3 min', route: 'feed', company: '' });

      const m = { tasks, done: tasks.map(() => false) };
      try { localStorage.setItem(storageKey, JSON.stringify(m)); } catch {}
      setMission(m);
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!mission?.tasks?.length) return null;

  const save = (next) => {
    setMission(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  const toggle = (i) => save({ ...mission, done: mission.done.map((d, j) => (j === i ? !d : d)) });
  const markDone = (i) => save({ ...mission, done: mission.done.map((d, j) => (j === i ? true : d)) });

  const go = (t, i) => {
    if (t.discoveryId) base44.entities.CliffDiscovery.update(t.discoveryId, { status: 'actioned' }).catch(() => {});
    if (t.kind === 'followup') { setDraftTask({ ...t, index: i }); return; } // draft opens right here — no navigation
    if (t.route === 'workspace') openCliffWorkspace({ company: t.company, role: t.role || '', jobUrl: t.jobUrl || '' });
    else if (t.route?.startsWith('#/')) window.location.hash = t.route;
    else document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth' });
  };

  const doneCount = mission.done.filter(Boolean).length;
  const complete = doneCount === mission.tasks.length;

  return (
    <div style={{ background: '#fff', border: complete ? '1px solid #a7f3d0' : '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="#7c3aed" />
          <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Today's Mission</h3>
        </div>
        <span style={{ fontFamily: dm, fontSize: 15, letterSpacing: 2 }}>
          {mission.done.map((d, i) => <span key={i}>{d ? '✅' : '⬜'}</span>)}
        </span>
      </div>
      <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>Here's what we're doing today.</p>

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
              <span style={{ fontSize: 15, flexShrink: 0 }}>{MEDALS[i] || '▫️'}</span>
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
                  onClick={() => go(t, i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Go <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {draftTask && (
        <MissionDraftModal
          task={draftTask}
          user={user}
          onClose={() => setDraftTask(null)}
          onSent={() => { markDone(draftTask.index); setDraftTask(null); }}
        />
      )}
    </div>
  );
}