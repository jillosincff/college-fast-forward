import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const DEFAULT_ACTIONS = [
  'Reach out to 3 people today',
  'Follow up with 2 contacts',
  'Apply to 1 targeted role',
  'Update LinkedIn summary',
];

export default function WhatToDoNext({ actions }) {
  const items = actions && actions.length > 0 ? actions : DEFAULT_ACTIONS;
  const [checked, setChecked] = useState(new Set());

  const toggle = (i) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #15171C 0%, #181B22 100%)',
      borderRadius: 16,
      border: '1px solid rgba(79,140,255,0.2)',
      padding: '28px 28px 24px',
      boxShadow: '0 0 40px rgba(79,140,255,0.04)',
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          ✅ What to do next
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Follow this — don't overthink it.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
            {checked.size} of {items.length} complete
          </span>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#4F8CFF' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg, #4F8CFF, #34D399)',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((action, i) => {
          const done = checked.has(i);
          return (
            <button key={i} onClick={() => toggle(i)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 10,
              background: done ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
              border: done ? '1px solid rgba(52,211,153,0.15)' : '1px solid #1F2128',
              cursor: 'pointer', transition: 'all 0.2s',
              minHeight: 'auto', width: '100%', textAlign: 'left',
            }}
              onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              {done
                ? <CheckCircle2 size={20} style={{ color: '#34D399', flexShrink: 0 }} />
                : <Circle size={20} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              }
              <span style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                color: done ? 'rgba(255,255,255,0.4)' : '#fff',
                textDecoration: done ? 'line-through' : 'none',
                transition: 'all 0.2s',
              }}>
                {action}
              </span>
            </button>
          );
        })}
      </div>

      {checked.size > 0 && checked.size < items.length && (
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400,
          color: 'rgba(255,255,255,0.35)', marginTop: 16, textAlign: 'center',
        }}>
          You're on the right track.
        </p>
      )}
      {checked.size === items.length && items.length > 0 && (
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 500,
          color: '#34D399', marginTop: 16, textAlign: 'center',
        }}>
          ✨ All done for today. Come back tomorrow.
        </p>
      )}
    </div>
  );
}