import React from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function DashboardHero({ user, fastiqStats }) {
  const firstName = user?.first_name || (() => {
    const fn = user?.full_name?.trim() || '';
    if (fn.includes(',')) return fn.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator';
    return fn.split(/\s+/)[0] || 'Gator';
  })();

  const major = user?.major || user?.student_major || '';
  const classYear = user?.graduation_year || user?.student_year || '';

  const newOpps = fastiqStats?.newOpportunities || 0;
  const newAlumni = fastiqStats?.newAlumni || 0;
  const showAlert = newOpps > 0 || newAlumni > 0;

  return (
    <header className="dash-hero" style={{
      background: '#0d1117', padding: '28px 32px 32px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @media(max-width:768px) {
          .dash-hero { padding: 20px 20px 24px !important; }
          .dash-hero .fiq-alert-time { display: none !important; }
        }
      `}</style>
      {/* Radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -60, right: -60, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(232,93,32,0.08)', pointerEvents: 'none',
      }} />

      {/* Greeting */}
      <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 26,
          color: '#f4f0e8', letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.2,
        }}>
          Hey {firstName}. 👋
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.4)' }}>
          UF{major ? ` · ${major}` : ''}
          {classYear ? (
            <> · Class of <span style={{ color: '#E85D20', fontWeight: 400 }}>{classYear}</span></>
          ) : null}
        </p>
      </div>

      {/* FASTIQ Alert */}
      {showAlert && (
        <button onClick={() => navigate('FastIQ')} className="fiq-alert" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          width: '100%', textAlign: 'left',
          background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.25)',
          borderRadius: 12, padding: '14px 18px',
          cursor: 'pointer', transition: 'background 0.2s', position: 'relative', zIndex: 1,
          minHeight: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.13)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.08)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            {/* Lightning icon */}
            <div style={{
              width: 32, height: 32, flexShrink: 0, borderRadius: 8,
              background: 'rgba(232,93,32,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <strong style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8',
                display: 'block', marginBottom: 2,
              }}>
                FASTIQ found {newOpps} new opportunities & {newAlumni} UF alumni since your last visit
              </strong>
              <span className="fiq-alert-time" style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)',
              }}>
                Last scan: 2 hours ago · Running continuously
              </span>
            </div>
          </div>
          <span style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            View Now →
          </span>
        </button>
      )}
    </header>
  );
}