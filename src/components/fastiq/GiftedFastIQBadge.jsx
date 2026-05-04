import React from 'react';
import { formatDisplayName } from '@/lib/formatDisplayName';

/**
 * Shown on the student dashboard when FastIQ was gifted by a parent.
 * Read-only — no cancel/manage controls.
 */
export default function GiftedFastIQBadge({ user }) {
  if (!user?.fastiq_gifted_by_user_id) return null;

  const parentName = user.linked_parent_name
    ? formatDisplayName(user.linked_parent_name)
    : 'a parent';

  const renewsDate = user.trial_end_date
    ? new Date(user.trial_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 100, padding: '5px 14px',
    }}>
      <span style={{ fontSize: 13 }}>🎁</span>
      <span style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 12, fontWeight: 600, color: '#15803D',
        whiteSpace: 'nowrap',
      }}>
        FastIQ gifted by {parentName}
        {renewsDate ? ` · Trial ends ${renewsDate}` : ''}
      </span>
    </div>
  );
}