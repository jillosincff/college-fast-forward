import React from 'react';

export default function InsightCard({ unmessagedAlumni, onOpenChat, onAddTargets, profile }) {
  const hasUnmessaged = unmessagedAlumni > 0;
  const targets = profile?.target_companies?.length || 0;

  let message, cta;
  if (hasUnmessaged) {
    message = (
      <>
        Students who reach out within 48 hours of identifying an alumni get{' '}
        <span style={{ color: '#FA4616', fontWeight: 700 }}>3x more replies</span>.
        You have {unmessagedAlumni} alumni you haven't messaged yet — want me to draft something?
      </>
    );
    cta = 'Draft Messages →';
  } else if (targets < 3) {
    message = (
      <>
        Students with <span style={{ color: '#FA4616', fontWeight: 700 }}>3+ target companies</span> get matched
        to 2x more alumni. Add more targets to expand your network.
      </>
    );
    cta = 'Add Targets →';
  } else {
    message = (
      <>
        Your pipeline is building. Students who follow up weekly see{' '}
        <span style={{ color: '#FA4616', fontWeight: 700 }}>5x more interview invites</span>.
        Keep the momentum going.
      </>
    );
    cta = 'View Pipeline →';
  }

  return (
    <div className="fiq-animate fiq-delay-2" style={{
      background: 'linear-gradient(135deg, rgba(0,33,165,0.06), rgba(250,70,22,0.04))',
      border: '1px solid rgba(0,33,165,0.1)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 32,
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,33,165,0.12), rgba(250,70,22,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>💡</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>FASTIQ Insight</div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{message}</div>
        <button
          onClick={() => {
            if (hasUnmessaged) {
              onOpenChat('Draft outreach messages for alumni I haven\'t contacted yet');
            } else if (targets < 3 && onAddTargets) {
              onAddTargets();
            } else {
              onOpenChat('');
            }
          }}
          style={{
            marginTop: 10, background: 'none', border: '1.5px solid #0021A5',
            color: '#0021A5', padding: '6px 16px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}