import { FONT, R } from './onboardingShared';

/**
 * One number that reframes the job search: the grind they know vs. what
 * CLIFF just did in under a minute. Shown on the reveal, right after the
 * rewritten resume lands.
 */
export default function RealityCheckStat() {
  return (
    <div style={{ background: '#0F172A', borderRadius: R, padding: '24px 28px', marginBottom: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 12px 30px rgba(15,23,42,0.25)' }}>
      <div style={{ flex: '1 1 220px' }}>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#F87171', letterSpacing: '-0.03em', margin: '0 0 4px', lineHeight: 1 }}>
          84 applications
        </p>
        <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(226,232,240,0.7)', margin: 0, lineHeight: 1.6 }}>
          is what the average student sends before landing a role. Most never hear back.
        </p>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(148,163,184,0.25)', minHeight: 60 }} className="hidden md:block" />
      <div style={{ flex: '1 1 220px' }}>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#34D399', letterSpacing: '-0.03em', margin: '0 0 4px', lineHeight: 1 }}>
          One minute
        </p>
        <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(226,232,240,0.7)', margin: 0, lineHeight: 1.6 }}>
          is how long it took me to rewrite yours. That's the difference — you stop doing the work.
        </p>
      </div>
    </div>
  );
}