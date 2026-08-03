import { useState, useEffect } from 'react';
import { getLandingTeaser } from '@/functions/getLandingTeaser';
import { FONT, R } from './onboardingShared';

/**
 * The unfair-advantage beat of the magic moment.
 * The real asset is the search: CLIFF finds alumni from the student's school
 * working at ANY company in the US — not a small in-app directory. The CLIFF
 * network (parents + alumni already inside) is shown as a bonus tier when it
 * actually has people, never as the headline.
 */
export default function ParentAdvantageCard({ college }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!college) return;
    getLandingTeaser({ school: college })
      .then(res => setData(res?.data || null))
      .catch(() => {});
  }, [college]);

  const school = (college || '').trim();
  const insideCount = data?.found ? (data.count || 0) : 0;

  return (
    <div style={{ background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '28px 30px', marginBottom: 28, boxShadow: '0 12px 32px rgba(76,29,149,0.28)' }}>
      <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 12px' }}>
        Your unfair advantage
      </p>
      <h3 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 10px' }}>
        Name any company. CLIFF finds the {school ? `${school} ` : ''}alumni working there.
      </h3>
      <p style={{ fontFamily: FONT, fontSize: 15, color: 'rgba(237,233,254,0.85)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 620 }}>
        Not a small directory — a live search across companies nationwide. CLIFF finds who to talk to, why they'd help you, and writes the message. A cold application lands in a pile of 800. A warm intro goes to the person hiring.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        {['Finds alumni at your target companies', 'Ranks who is most likely to reply', 'Drafts the intro in your voice'].map((t, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,181,253,0.25)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{t}</p>
          </div>
        ))}
      </div>

      {insideCount > 0 && (
        <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(237,233,254,0.8)', margin: '0 0 12px' }}>
          Plus {insideCount} parents and alumni from your school already inside CLIFF, ready to help.
        </p>
      )}

      <p style={{ fontFamily: FONT, fontSize: 12.5, color: 'rgba(196,181,253,0.75)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span>🔒</span> Names and intro paths unlock when CLIFF starts working for you.
      </p>
    </div>
  );
}

ParentAdvantageCard.defaultProps = { college: '' };