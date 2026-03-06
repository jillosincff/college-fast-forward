import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * "Since your last visit" banner — dismissed per session and stays hidden until next visit.
 */
export default function WeeklyBriefBanner({ weeklyStats, onViewBrief, onDismissed }) {
  const STORAGE_KEY = 'fiq_banner_dismissed_at';
  const [dismissed, setDismissed] = useState(false);

  // Check if banner was already dismissed this session
  useEffect(() => {
    const dismissedAt = sessionStorage.getItem(STORAGE_KEY);
    if (dismissedAt) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
    if (onDismissed) onDismissed();
  };

  if (dismissed) return null;

  const { alumniFound = 0, companiesScanned = 0, topSignal, opportunities = 0, entryLevelRoles = 0, internRoles = 0 } = weeklyStats || {};

  // Build natural-language sentence(s) instead of stat shorthand
  const sentences = [];
  if (alumniFound > 0) {
    sentences.push(`FASTIQ found ${alumniFound} new alumni at your targets`);
  }
  const studentRelevantRoles = entryLevelRoles + internRoles;
  if (topSignal && studentRelevantRoles > 0) {
    sentences.push(`${topSignal} is now actively hiring with ${studentRelevantRoles} entry-level/intern role${studentRelevantRoles > 1 ? 's' : ''}`);
  } else if (topSignal) {
    sentences.push(`${topSignal} moved to Hot — now actively hiring`);
  } else if (studentRelevantRoles > 0) {
    sentences.push(`${studentRelevantRoles} new entry-level/intern role${studentRelevantRoles > 1 ? 's were' : ' was'} posted at your target companies`);
  } else if (opportunities > 0) {
    sentences.push(`${opportunities} new opportunit${opportunities > 1 ? 'ies were' : 'y was'} scouted for you`);
  }
  if (companiesScanned > 0 && sentences.length === 0) {
    sentences.push(`FASTIQ scanned ${companiesScanned} companies for new openings`);
  }

  // If no targets, hide the banner entirely (no ghost data)
  if (weeklyStats && weeklyStats._noTargets) {
    return null;
  }

  if (sentences.length === 0) {
    return null;
  }
  const summaryText = sentences.join(' and ') + '.';

  return (
    <div className="fiq-animate" style={{
      background: 'linear-gradient(135deg, rgba(0,33,165,0.06) 0%, rgba(0,33,165,0.01) 60%, transparent 100%)',
      borderLeft: '4px solid #0021A5', borderRadius: 12, padding: '14px 18px',
      marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,33,165,0.06)',
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
            {summaryText}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onViewBrief} style={{
          fontSize: 11, fontWeight: 700, color: '#fff', background: '#0021A5',
          padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
          minHeight: 'auto', whiteSpace: 'nowrap',
        }}>
          View Brief →
        </button>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: '#94A3B8', minHeight: 'auto',
        }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}