import { useState, useEffect } from 'react';
import { getLandingTeaser } from '@/functions/getLandingTeaser';
import { FONT, R } from './onboardingShared';

/**
 * The unfair-advantage beat of the magic moment: real parents + alumni from the
 * student's own school who are already inside CLIFF. Companies are real; names
 * stay locked until they're a member.
 */
export default function ParentAdvantageCard({ college }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!college) return;
    getLandingTeaser({ school: college })
      .then(res => setData(res?.data || null))
      .catch(() => {});
  }, [college]);

  if (!data?.found || !data.count) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '28px 30px', marginBottom: 28, boxShadow: '0 12px 32px rgba(76,29,149,0.28)' }}>
      <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 12px' }}>
        Your unfair advantage
      </p>
      <h3 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 10px' }}>
        {data.count} parents and alumni from your school are already inside CLIFF.
      </h3>
      <p style={{ fontFamily: FONT, fontSize: 15, color: 'rgba(237,233,254,0.85)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 620 }}>
        A cold application goes into a pile of 800. A warm intro goes straight to the person hiring. No job board can give you this — it only exists here.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        {(data.matches || []).map((m, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{m.company}</p>
            <p style={{ fontFamily: FONT, fontSize: 11, color: '#c4b5fd', margin: 0 }}>{m.persona} · {m.role}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: FONT, fontSize: 12.5, color: 'rgba(196,181,253,0.75)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span>🔒</span> Names and intro paths unlock when CLIFF starts working for you.
      </p>
    </div>
  );
}

ParentAdvantageCard.defaultProps = { college: '' };