import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Slim dismissible banner showing "Since your last visit" summary.
 * Shows below hero, above resume section when there's new activity.
 */
export default function WeeklyBriefBanner({ weeklyStats, onViewBrief }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const { alumniFound = 0, companiesScanned = 0, topSignal, opportunities = 0 } = weeklyStats || {};
  const hasActivity = alumniFound > 0 || companiesScanned > 0 || topSignal || opportunities > 0;
  if (!hasActivity) return null;

  const parts = [];
  if (alumniFound > 0) parts.push(`${alumniFound} alumni`);
  if (companiesScanned > 0) parts.push(`${companiesScanned} companies`);
  if (topSignal) parts.push(`${topSignal} moved to Hot`);
  if (opportunities > 0) parts.push(`${opportunities} new opportunities`);

  return (
    <div className="fiq-animate" style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
      border: '1px solid #BFDBFE',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 16 }}>📬</span>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', margin: 0 }}>
          Since your last visit: {parts.join(' · ')}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onViewBrief}
          style={{
            fontSize: 11, fontWeight: 700, color: '#0021A5',
            background: 'rgba(0,33,165,0.08)', padding: '6px 14px',
            borderRadius: 8, border: 'none', cursor: 'pointer', minHeight: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          View Brief →
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: '#94A3B8', minHeight: 'auto',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}