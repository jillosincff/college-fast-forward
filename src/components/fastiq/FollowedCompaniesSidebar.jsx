import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import titleCase from '@/components/utils/titleCase';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SIGNAL_COLORS = { green: '#4CAF50', yellow: '#FFA726', red: '#e53935' };

export default function FollowedCompaniesSidebar({ user, onOpenChat, alertCounts = {} }) {
  const [companies, setCompanies] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FollowedCompany.filter({ student_email: user.email }, '-added_at', 20)
      .then(r => setCompanies(r || []))
      .catch(() => {});
  }, [user?.email]);

  const handleAdd = async () => {
    const name = titleCase(input.trim());
    if (!name || companies.length >= 20) return;
    if (companies.some(c => c.company_name?.toLowerCase() === name.toLowerCase())) return;
    const record = await base44.entities.FollowedCompany.create({
      student_email: user.email, company_name: name,
      added_at: new Date().toISOString(), last_signal: 'yellow', alerts_enabled: true,
    });
    setCompanies(prev => [record, ...prev]);
    setInput('');
    setShowInput(false);
  };

  const totalAlerts = Object.values(alertCounts).reduce((s, v) => s + v, 0);

  if (companies.length === 0 && !showInput) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
          fontFamily: dmSans, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(244,240,232,0.4)', minHeight: 'auto',
        }}
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        MY COMPANIES
        {totalAlerts > 0 && (
          <span style={{
            marginLeft: 'auto', background: '#E85D20', color: '#fff',
            borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 600,
          }}>
            {totalAlerts}
          </span>
        )}
      </button>

      {expanded && (
        <div style={{ padding: '4px 0' }}>
          {companies.map(c => {
            const signalChanged = c.previous_signal && c.previous_signal !== c.last_signal;
            const signalUp = signalChanged && (c.last_signal === 'green' || (c.last_signal === 'yellow' && c.previous_signal === 'red'));
            const alerts = alertCounts[c.company_name?.toLowerCase()] || 0;

            return (
              <button
                key={c.id}
                onClick={() => onOpenChat && onOpenChat(`Research ${c.company_name} for me`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
                  background: 'transparent', border: 'none', textAlign: 'left',
                  transition: 'background 0.15s', position: 'relative', minHeight: 'auto',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Signal dot */}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: SIGNAL_COLORS[c.last_signal] || SIGNAL_COLORS.yellow,
                  animation: signalChanged ? 'fiqPulse 2s ease infinite' : 'none',
                }} />
                {/* Name */}
                <span style={{ flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(244,240,232,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.company_name}
                </span>
                {/* Change indicator */}
                {signalChanged && (
                  <span title={`Signal changed from ${c.previous_signal} to ${c.last_signal}`}
                    style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: signalUp ? '#4CAF50' : '#e53935' }}>
                    {signalUp ? '↑' : '↓'}
                  </span>
                )}
                {/* Alert dot */}
                {alerts > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 6, height: 6, borderRadius: '50%', background: '#E85D20',
                    animation: 'fiqAlertAppear 0.3s ease both',
                  }} />
                )}
              </button>
            );
          })}

          {/* Add company */}
          {showInput ? (
            <div style={{ padding: '4px 10px', display: 'flex', gap: 6 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false); }}
                placeholder="Company name..."
                autoFocus
                style={{
                  flex: 1, padding: '6px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.15)',
                  color: '#f4f0e8', fontFamily: dmSans, fontSize: 12, outline: 'none',
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(244,240,232,0.3)',
                minHeight: 'auto', width: 'auto',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#E85D20'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,240,232,0.3)'}
            >
              <Plus className="w-3 h-3" /> Add company
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes fiqAlertAppear { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fiqPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
      `}</style>
    </div>
  );
}