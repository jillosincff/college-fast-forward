import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SOURCE_COLORS = {
  career_path_research: { bg: '#FFF5F0', color: '#E85D20', border: '#FDDBC8' },
  career_goals: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  company_intel: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  career_concierge: { bg: '#FAF5FF', color: '#7C3AED', border: '#DDD6FE' },
  assessment: { bg: '#0d1117', color: '#E85D20', border: 'rgba(232,93,32,0.3)' },
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'career_path_research', label: 'Career Paths' },
  { id: 'company_intel', label: 'Company Intel' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'career_goals', label: 'Career Goals' },
  { id: 'career_concierge', label: 'General' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function EntryCard({ entry, onRemove }) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const colors = SOURCE_COLORS[entry.source_page] || SOURCE_COLORS.career_path_research;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await base44.entities.NotebookEntry.delete(entry.id);
      onRemove(entry.id);
    } catch (e) {
      console.error('Remove failed:', e);
    }
    setRemoving(false);
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20,
      transition: 'opacity 0.3s', opacity: removing ? 0 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <span style={{
          background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`,
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em',
        }}>
          {entry.source_label || entry.source_page}
        </span>
        <button
          onClick={() => setConfirmRemove(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCCCCC', minHeight: 'auto', padding: 2 }}
        >
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#333', lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
        {entry.content}
      </p>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: 0 }}>
        Saved {timeAgo(entry.saved_at || entry.created_date)}
      </p>

      {confirmRemove && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF5F0', borderRadius: 8, border: '1px solid #FDDBC8' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#E85D20', margin: '0 0 8px' }}>
            Remove this from your Notebook?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRemove}
              style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}
            >
              {removing ? 'Removing...' : 'Remove'}
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#666', cursor: 'pointer', minHeight: 'auto' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotebookPage({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    base44.entities.NotebookEntry.filter({ user_email: user.email }, '-saved_at', 100)
      .then(data => setEntries(data || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const handleRemove = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const filtered = activeFilter === 'all' ? entries : entries.filter(e => e.source_page === activeFilter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
        ⚡ FASTIQ NOTEBOOK
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
        Your Notebook
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: '0 0 24px' }}>
        Your saved insights, career notes, and research.
      </p>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            style={{
              background: activeFilter === f.id ? '#E85D20' : '#fff',
              color: activeFilter === f.id ? '#fff' : '#666',
              border: '1px solid',
              borderColor: activeFilter === f.id ? '#E85D20' : '#E0E0E0',
              borderRadius: 100, padding: '6px 16px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer', minHeight: 'auto',
              fontFamily: "'DM Sans', sans-serif",
            }}>
            {f.label}
          </button>
        ))}
        {entries.length > 0 && (
          <span style={{ marginLeft: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#AAAAAA', display: 'flex', alignItems: 'center' }}>
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Entries */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Loader2 style={{ width: 24, height: 24, color: '#E85D20', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Your Notebook is empty
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', lineHeight: 1.6 }}>
            {activeFilter === 'all'
              ? "When FastIQ gives you something worth keeping, tap the bookmark icon on any response to save it here."
              : "No entries in this category yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}