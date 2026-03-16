import React, { useState, useRef, useEffect } from 'react';
import { KARMA_DISPLAY_TIERS } from './karmaConfig';

const dmSans = "'DM Sans', system-ui, sans-serif";

/**
 * Tappable karma stat card that opens a tier-ladder tooltip.
 *
 * Props:
 *  - tierName: current tier string
 *  - points: total karma points
 *  - pointsToNext: points needed for next tier (0 if max)
 *  - nextTierName: name of next tier (null if max)
 *  - variant: "parent" | "alumni" — controls bottom-line copy
 *  - dark: boolean — if true, renders for dark-bg hero
 */
export default function KarmaLadderTooltip({ tierName, points, pointsToNext, nextTierName, variant = 'parent', dark = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  const bottomLine = variant === 'alumni'
    ? 'Higher karma = more visibility for your profile in the feed.'
    : 'Higher karma = more visibility for your student in the feed.';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Tappable card */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', cursor: 'pointer', background: 'none', border: 'none', padding: 0,
          textAlign: 'center', minHeight: 'auto',
        }}
      >
        {/* Tier name */}
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700,
          color: points > 0 ? '#E85D20' : (dark ? 'rgba(244,240,232,0.25)' : 'rgba(0,0,0,0.15)'),
          marginBottom: 2,
        }}>
          {points > 0 ? tierName : '--'}
        </p>

        {/* Points */}
        <p style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 400,
          color: dark ? 'rgba(244,240,232,0.45)' : '#888', marginBottom: 1,
        }}>
          {points} pts
        </p>

        {/* Points to next */}
        {nextTierName && pointsToNext > 0 ? (
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 300,
            color: dark ? 'rgba(244,240,232,0.3)' : '#bbb',
          }}>
            {pointsToNext} pts to {nextTierName}
          </p>
        ) : points > 0 ? (
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 300,
            color: dark ? 'rgba(244,240,232,0.3)' : '#bbb',
          }}>
            Max tier reached ✨
          </p>
        ) : null}
      </button>

      {/* Tooltip */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 10, zIndex: 300, minWidth: 260,
          background: dark ? '#1a1f2e' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: 14, padding: '18px 20px',
          boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
            width: 12, height: 12,
            background: dark ? '#1a1f2e' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
            borderBottom: 'none', borderRight: 'none',
          }} />

          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600,
            color: dark ? '#f4f0e8' : '#1a1a1a', marginBottom: 14, textAlign: 'center',
          }}>
            Karma Tiers
          </p>

          {/* Tier ladder */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            {KARMA_DISPLAY_TIERS.map((tier) => {
              const isActive = tier.name === tierName;
              return (
                <div key={tier.name} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? '#E85D20' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                    border: isActive ? 'none' : (dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'),
                  }}>
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 6l2.5 2.5L9 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <p style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#E85D20' : (dark ? 'rgba(244,240,232,0.5)' : '#888'),
                    marginBottom: 2,
                  }}>
                    {tier.name}
                  </p>
                  <p style={{
                    fontFamily: dmSans, fontSize: 10, fontWeight: 300,
                    color: dark ? 'rgba(244,240,232,0.3)' : '#bbb',
                  }}>
                    {tier.threshold}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Connecting line */}
          <div style={{
            height: 2, borderRadius: 1, marginBottom: 14,
            background: dark
              ? 'linear-gradient(90deg, rgba(255,255,255,0.08), #E85D20, rgba(255,255,255,0.08))'
              : 'linear-gradient(90deg, rgba(0,0,0,0.05), #E85D20, rgba(0,0,0,0.05))',
          }} />

          {/* Bottom line */}
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 400,
            color: dark ? 'rgba(244,240,232,0.45)' : '#888',
            textAlign: 'center', lineHeight: 1.4,
          }}>
            {bottomLine}
          </p>
        </div>
      )}
    </div>
  );
}