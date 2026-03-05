import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Slim dismissible banner showing "Since your last visit" summary.
 * Styled as a notification with blue left border and subtle gradient.
 */
export default function WeeklyBriefBanner({ weeklyStats, onViewBrief }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const { alumniFound = 0, companiesScanned = 0, topSignal, opportunities = 0, entryLevelRoles = 0, internRoles = 0 } = weeklyStats || {};

  // Build display parts — reference entry-level/intern roles, not generic totals
  const parts = [];
  const studentRelevantRoles = entryLevelRoles + internRoles;
  if (studentRelevantRoles > 0) {
    parts.push(`${studentRelevantRoles} entry-level/intern role${studentRelevantRoles > 1 ? 's' : ''} found`);
  } else if (opportunities > 0) {
    parts.push(`${opportunities} new opportunities`);
  }
  if (alumniFound > 0) parts.push(`${alumniFound} alumni found`);
  if (companiesScanned > 0) parts.push(`${companiesScanned} companies scanned`);
  if (topSignal) parts.push(`${topSignal} moved to Hot`);

  // If nothing meaningful, show generic or hide
  if (parts.length === 0) return null;

  return (
    <div className="fiq-animate" style={{
      background: 'linear-gradient(135deg, rgba(0,33,165,0.06) 0%, rgba(0,33,165,0.01) 60%, transparent 100%)',
      borderLeft: '4px solid #0021A5',
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      boxShadow: '0 2px 8px rgba(0,33,165,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(0,33,165,0.08)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>📬</span>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#0021A5', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Since your last visit
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: '2px 0 0' }}>
            {parts.join(' · ')}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onViewBrief}
          style={{
            fontSize: 11, fontWeight: 700, color: '#fff',
            background: '#0021A5', padding: '7px 16px',
            borderRadius: 8, border: 'none', cursor: 'pointer', minHeight: 'auto',
            whiteSpace: 'nowrap', transition: 'all 0.2s',
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