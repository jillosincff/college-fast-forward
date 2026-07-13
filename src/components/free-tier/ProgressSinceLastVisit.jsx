import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "Since your last visit" progress recap shown inside the premium hero.
export default function ProgressSinceLastVisit({ user }) {
  const [items, setItems] = useState(null);
  const [nextMove, setNextMove] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    const key = `cliff_last_visit_${user.email}`;
    let since;
    try {
      const prev = localStorage.getItem(key);
      since = prev ? new Date(prev).getTime() : Date.now() - 86400000;
      localStorage.setItem(key, new Date().toISOString());
    } catch { since = Date.now() - 86400000; }

    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      base44.entities.UserDailyDrop.filter({ user_email: user.email, drop_date: today }).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
      base44.entities.JobPursuit.filter({ user_email: user.email }, '-updated_date', 5).catch(() => []),
    ]).then(([drops, resumes, pursuits]) => {
      if (cancelled) return;
      const list = [];
      const drop = (drops || [])[0];
      const freshJobs = drop ? (drop.slots || []).filter(s => !(drop.actioned_keys || []).includes(s.key)).length : 0;
      if (freshJobs > 0) list.push(`Found ${freshJobs} new matching job${freshJobs === 1 ? '' : 's'}`);

      const newResumes = (resumes || []).filter(r => r.status === 'completed' && new Date(r.created_date).getTime() >= since);
      if (newResumes.length === 1) list.push(`Improved your resume for ${newResumes[0].company_name}`);
      else if (newResumes.length > 1) list.push(`Prepared ${newResumes.length} applications`);

      const withConnections = (pursuits || []).find(p => ['ready_for_review', 'complete'].includes(p.connection_search_status));
      if (withConnections) list.push(`Found a networking opportunity at ${withConnections.company_name}`);

      const withNext = (pursuits || []).find(p => p.next_action);
      if (withNext) setNextMove(`${withNext.next_action} (${withNext.company_name})`);
      else if (freshJobs > 0) setNextMove("Check today's matches below");

      setItems(list);
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (items === null) return null;

  return (
    <div style={{ margin: '0 0 24px', maxWidth: 680 }}>
      {items.length > 0 ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Since your last visit</p>
          {items.map((line, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 5px', lineHeight: 1.5 }}>✅ {line}</p>
          ))}
        </>
      ) : (
        <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
          CLIFF is scouting new matches for you right now — your next opportunities land in the feed below.
        </p>
      )}
      {nextMove && (
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#c4b5fd', margin: '10px 0 0', lineHeight: 1.5 }}>🎯 Next best move: {nextMove}</p>
      )}
    </div>
  );
}