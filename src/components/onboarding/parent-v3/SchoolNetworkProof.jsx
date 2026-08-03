import React, { useState, useEffect } from 'react';
import { getLandingTeaser } from '@/functions/getLandingTeaser';
import { dmSans, ORANGE } from './ParentOnboardingShell';

/**
 * Turns the abstract ask ("give us your background") into a concrete one by
 * showing the real network already at the student's school the moment a parent
 * finishes typing it. Renders nothing until we have a confirmed match.
 */
export default function SchoolNetworkProof({ school }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const q = (school || '').trim();
    if (q.length < 4) { setData(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await getLandingTeaser({ school: q });
        const payload = res?.data || res;
        if (!cancelled) setData(payload?.found ? payload : null);
      } catch {
        if (!cancelled) setData(null);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [school]);

  if (!data || !data.count) return null;

  return (
    <div style={{
      background: 'rgba(109,40,217,0.06)',
      border: '1px solid rgba(109,40,217,0.18)',
      borderRadius: 12,
      padding: '12px 16px',
      marginTop: 10,
      animation: 'poFadeUp 0.4s ease both',
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE, margin: 0, lineHeight: 1.5 }}>
        {data.count} {data.count === 1 ? 'parent and alum is' : 'parents and alumni are'} already helping students here.
      </p>
      {data.matches?.length > 0 && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#475569', margin: '5px 0 0', lineHeight: 1.5 }}>
          Including people at {data.matches.map(m => m.company).join(', ')} — students search by company like yours.
        </p>
      )}
    </div>
  );
}