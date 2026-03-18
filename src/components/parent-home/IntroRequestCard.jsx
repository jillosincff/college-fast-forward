import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { dmSans, ORANGE, CARD_BG, BORDER, MUTED, AMBER, GREEN } from './constants';
import moment from 'moment';

function timeSince(dateStr) {
  if (!dateStr) return '';
  const m = moment(dateStr);
  const diff = moment().diff(m, 'hours');
  if (diff < 1) return 'Requested just now';
  if (diff < 24) return `Requested ${diff} hour${diff > 1 ? 's' : ''} ago`;
  const days = Math.floor(diff / 24);
  return `Requested ${days} day${days > 1 ? 's' : ''} ago`;
}

function SingleRequest({ match, onRespond }) {
  const [state, setState] = useState('idle'); // idle | confirmed | passed

  const studentName = match.student_name?.split(' ')[0] || 'A student';
  const university = match.student_major ? `${studentName} · ${match.student_major}` : studentName;
  const reason = match.match_reasons?.length ? match.match_reasons[0] : 'You may be able to help';
  const company = match.request_description || '';

  const handleHelp = async () => {
    setState('confirmed');
    await base44.entities.Match.update(match.id, { status: 'parent_reached_out' }).catch(() => {});
    setTimeout(() => onRespond(match.id, 'helped'), 2000);
  };

  const handlePass = async () => {
    setState('passed');
    await base44.entities.Match.update(match.id, { status: 'passed' }).catch(() => {});
    setTimeout(() => onRespond(match.id, 'passed'), 500);
  };

  if (state === 'confirmed') {
    return (
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 12, transition: 'opacity 0.5s', opacity: 0.7 }}>
        <span style={{ fontSize: 20, color: GREEN }}>✓</span>
        <span style={{ fontFamily: dmSans, fontSize: 14, color: GREEN, fontWeight: 500 }}>Introduction confirmed ✓</span>
      </div>
    );
  }

  if (state === 'passed') return null;

  // Check expiry (matches created_date + 24h)
  let expiryWarning = null;
  if (match.created_date) {
    const hoursLeft = 24 - moment().diff(moment(match.created_date), 'hours');
    if (hoursLeft > 0 && hoursLeft <= 12) {
      expiryWarning = `Expires in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
    }
  }

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{university}</p>
      {company && <p style={{ fontFamily: dmSans, fontSize: 13, color: '#ccc', marginTop: 4 }}>{company}</p>}
      <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, marginTop: 4 }}>{reason}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, color: MUTED }}>{timeSince(match.created_date)}</span>
        {expiryWarning && <span style={{ fontFamily: dmSans, fontSize: 11, color: AMBER, fontWeight: 500 }}>{expiryWarning}</span>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={handleHelp} style={{
          flex: 1, padding: '12px 16px', borderRadius: 100, border: 'none',
          background: ORANGE, color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', minHeight: 'auto',
        }}>Yes, I can help →</button>
        <button onClick={handlePass} style={{
          flex: 1, padding: '12px 16px', borderRadius: 100,
          background: 'transparent', border: `1px solid #444`, color: MUTED,
          fontFamily: dmSans, fontSize: 14, fontWeight: 500, cursor: 'pointer', minHeight: 'auto',
        }}>Not this time</button>
      </div>
    </div>
  );
}

export default function IntroRequestCard({ matches, onRespond }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const visible = matches.filter(m => !dismissedIds.has(m.id)).slice(0, 3);
  const remaining = matches.filter(m => !dismissedIds.has(m.id)).length - 3;

  const handleRespond = (id) => {
    setDismissedIds(prev => new Set([...prev, id]));
    if (onRespond) onRespond();
  };

  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
        ACTION NEEDED
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(m => <SingleRequest key={m.id} match={m} onRespond={handleRespond} />)}
      </div>
      {remaining > 0 && (
        <p style={{ fontFamily: dmSans, fontSize: 13, color: ORANGE, marginTop: 12, cursor: 'pointer' }}>
          +{remaining} more requests waiting → See all
        </p>
      )}
    </div>
  );
}