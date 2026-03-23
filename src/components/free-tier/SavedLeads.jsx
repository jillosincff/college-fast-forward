import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SavedLeadCard({ lead, onContact, onRemove }) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isContacted = lead.contacted;

  return (
    <div style={{
      background: isContacted ? '#FAFAFA' : '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 10,
      padding: '14px 16px',
      opacity: isContacted ? 0.8 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14 }}>{lead.type === 'hot' ? '🔥' : '🎯'}</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: 0 }}>{lead.name}</p>
          </div>
          {lead.title && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: '0 0 2px' }}>{lead.title}{lead.company ? ` · ${lead.company}` : ''}</p>}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: 0 }}>Saved {timeAgo(lead.saved_at)}</p>
        </div>
      </div>

      {isContacted ? (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: '0 0 8px', fontWeight: 600 }}>
            ✓ Contacted {lead.contacted_at ? timeAgo(lead.contacted_at) : ''}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onContact(lead)}
              style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
              Follow Up →
            </button>
            <button onClick={() => setConfirmRemove(true)}
              style={{ background: 'none', border: '1px solid #E0E0E0', color: '#999', borderRadius: 100, padding: '6px 10px', fontSize: 12, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trash2 style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onContact(lead)}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Contact Now →
          </button>
          <button onClick={() => setConfirmRemove(true)}
            style={{ background: 'none', border: '1px solid #E0E0E0', color: '#999', borderRadius: 100, padding: '6px 10px', fontSize: 12, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Trash2 style={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}

      {confirmRemove && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFF5F0', borderRadius: 8, border: '1px solid #FDDBC8' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', margin: '0 0 6px' }}>Remove this lead?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onRemove(lead.id)}
              style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Remove</button>
            <button onClick={() => setConfirmRemove(false)}
              style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedLeads({ savedLeads, onContact, onRemove }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Hot Leads', 'Warm Leads', 'Contacted'];

  const filtered = savedLeads.filter(l => {
    if (filter === 'Hot Leads') return l.type === 'hot' && !l.contacted;
    if (filter === 'Warm Leads') return l.type === 'warm' && !l.contacted;
    if (filter === 'Contacted') return l.contacted;
    return true;
  });

  const notContacted = filtered.filter(l => !l.contacted);
  const contacted = filtered.filter(l => l.contacted);

  return (
    <section style={{ marginTop: 40 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
        🔖 YOUR SAVED LEADS
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0 16px' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#E85D20' : '#fff',
              color: filter === f ? '#fff' : '#666',
              border: '1px solid', borderColor: filter === f ? '#E85D20' : '#E0E0E0',
              borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto',
            }}>
            {f}
          </button>
        ))}
      </div>

      {savedLeads.length === 0 ? (
        <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 24, margin: '0 0 8px' }}>🔖</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>No saved leads yet.</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>Tap 🔖 on any lead above to save them here for later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notContacted.length > 0 && (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>── Not contacted yet ──</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notContacted.map(l => <SavedLeadCard key={l.id} lead={l} onContact={onContact} onRemove={onRemove} />)}
              </div>
            </div>
          )}
          {contacted.length > 0 && (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>── Already contacted ──</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contacted.map(l => <SavedLeadCard key={l.id} lead={l} onContact={onContact} onRemove={onRemove} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}