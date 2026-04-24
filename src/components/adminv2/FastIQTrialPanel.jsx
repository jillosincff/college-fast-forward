import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function FastIQTrialPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);
      const trialUsers = allUsers.filter(u => {
        return (
          u.fastiq_trial_active === true ||
          u.trial_status === 'active' ||
          u.membership_tier === 'fastiq_trial' ||
          u.membership_tier === 'fastiq' ||
          u.fastiq_setup_complete === true ||
          u.subscription_status === 'active'
        );
      });
      setUsers(trialUsers);
    } catch (e) {
      console.error('FastIQ trial panel error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const now = new Date();

  const active = users.filter(u => {
    if (u.subscription_status === 'active') return true;
    if (u.fastiq_trial_active === true || u.trial_status === 'active') {
      if (u.trial_end_date) return new Date(u.trial_end_date) > now;
      return true;
    }
    return false;
  });

  const paying = users.filter(u => u.subscription_status === 'active');
  const trialing = users.filter(u => (u.fastiq_trial_active === true || u.trial_status === 'active') && u.subscription_status !== 'active');
  const expired = users.filter(u => {
    if (u.subscription_status === 'active') return false;
    if (u.trial_end_date && new Date(u.trial_end_date) <= now) return true;
    return false;
  });

  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '24px',
      fontFamily: dmSans,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
            ⚡ FastIQ Subscribers & Trials
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Who has FastIQ access right now
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
          minHeight: 'auto',
        }}>
          <RefreshCw style={{ width: 12, height: 12, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Paying', value: paying.length, color: '#22c55e' },
          { label: 'On Trial', value: trialing.length, color: '#E85D20' },
          { label: 'Trial Expired', value: expired.length, color: '#ef4444' },
          { label: 'Total Access', value: active.length, color: '#4F8CFF' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{loading ? '…' : value}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* User list */}
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading…</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No FastIQ users found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
          {users.map(u => {
            const isPaying = u.subscription_status === 'active';
            const isTrial = u.fastiq_trial_active === true || u.trial_status === 'active';
            const trialEnd = u.trial_end_date ? new Date(u.trial_end_date) : null;
            const isExpired = trialEnd && trialEnd <= now && !isPaying;
            const daysLeft = trialEnd && !isPaying ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;

            let badge = '';
            let badgeColor = '';
            if (isPaying) { badge = '✅ Paying'; badgeColor = '#22c55e'; }
            else if (isExpired) { badge = '❌ Expired'; badgeColor = '#ef4444'; }
            else if (isTrial) { badge = daysLeft !== null ? `⏳ ${daysLeft}d left` : '⏳ Trial'; badgeColor = '#E85D20'; }
            else { badge = '⚡ FastIQ'; badgeColor = '#4F8CFF'; }

            return (
              <div key={u.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.full_name || u.email}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
                    {u.email} · {u.persona || 'unknown'} {u.school_code ? `· ${u.school_code}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {trialEnd && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      ends {trialEnd.toLocaleDateString()}
                    </span>
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: badgeColor,
                    background: `${badgeColor}15`,
                    border: `1px solid ${badgeColor}40`,
                    borderRadius: 100, padding: '3px 10px',
                    whiteSpace: 'nowrap',
                  }}>
                    {badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}