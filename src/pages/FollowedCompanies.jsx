import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Loader2, X, Bookmark, ExternalLink, Pencil, Check, Zap } from 'lucide-react';
import titleCase from '@/components/utils/titleCase';
import moment from 'moment';

const SIGNAL_BADGE = {
  green: { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100 text-green-700' },
  yellow: { emoji: '🟡', label: 'Mixed Signals', bg: 'bg-yellow-100 text-yellow-700' },
  red: { emoji: '🔴', label: 'Caution', bg: 'bg-red-100 text-red-700' },
};

function CompanyCard({ company, onUnfollow, onViewBrief, onSaveNote }) {
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState(company.notes || '');

  const signal = SIGNAL_BADGE[company.last_signal] || SIGNAL_BADGE.yellow;
  const lastChecked = company.last_checked_at ? moment(company.last_checked_at).fromNow() : 'Not yet';
  const entryLevel = company.entry_level_count || 0;
  const internships = company.intern_count || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-slate-900 text-[15px]">{titleCase(company.company_name)}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${signal.bg}`}>{signal.emoji} {signal.label}</span>
        </div>
        {!confirmUnfollow ? (
          <button onClick={() => setConfirmUnfollow(true)} className="text-slate-300 hover:text-red-500 transition-colors p-1" style={{ minHeight: 'auto', width: 'auto' }}>
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Stop following?</span>
            <button onClick={() => onUnfollow(company.id)} className="text-red-500 font-medium hover:underline" style={{ minHeight: 'auto', width: 'auto' }}>Yes</button>
            <button onClick={() => setConfirmUnfollow(false)} className="text-orange-500 font-medium hover:underline" style={{ minHeight: 'auto', width: 'auto' }}>Keep</button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3">Checked {lastChecked}</p>

      {/* Recommendation */}
      {company.latest_recommendation && (
        <p className="text-sm text-slate-600 leading-relaxed mb-3">{company.latest_recommendation}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <span className={(entryLevel + internships) > 0 ? 'font-medium text-orange-600' : 'text-slate-400'}>
          {entryLevel} entry-level · {internships} internships
        </span>
        {company.alumni_count > 0 && <span className="text-slate-500">{company.alumni_count} UF alumni</span>}
      </div>

      {/* Notes */}
      {editingNote ? (
        <div className="flex gap-2 mb-3">
          <input value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onSaveNote(company.id, note); setEditingNote(false); } }}
            autoFocus className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Add a personal note..." />
          <button onClick={() => { onSaveNote(company.id, note); setEditingNote(false); }} className="text-green-600 hover:text-green-700" style={{ minHeight: 'auto', width: 'auto' }}>
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : company.notes ? (
        <p className="text-xs text-slate-400 italic mb-3 cursor-pointer hover:text-slate-600" onClick={() => setEditingNote(true)}>
          📝 {company.notes}
        </p>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button onClick={() => onViewBrief(company.company_name)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1" style={{ minHeight: 'auto', width: 'auto' }}>
          <ExternalLink className="w-3 h-3" /> View full brief
        </button>
        {!editingNote && (
          <button onClick={() => setEditingNote(true)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1" style={{ minHeight: 'auto', width: 'auto' }}>
            <Pencil className="w-3 h-3" /> {company.notes ? 'Edit note' : 'Add note'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FollowedCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.FollowedCompany.filter({ student_email: user.email }, '-added_at', 20)
      .then(r => { setCompanies(r || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const handleUnfollow = async (id) => {
    await base44.entities.FollowedCompany.delete(id);
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleViewBrief = (name) => {
    navigate('FastIQ');
    // Small delay to let page mount, then trigger chat
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('fastiq:open-chat', { detail: { message: `Research ${name} for me` } }));
    }, 500);
  };

  const handleSaveNote = async (id, note) => {
    await base44.entities.FollowedCompany.update(id, { notes: note });
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, notes: note } : c));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 28, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Companies I'm Watching
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 300, color: '#888', marginTop: 6 }}>
            FASTIQ monitors these 24/7 and alerts you when anything changes.
          </p>
        </div>

        {companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companies.map(c => (
              <CompanyCard key={c.id} company={c} onUnfollow={handleUnfollow} onViewBrief={handleViewBrief} onSaveNote={handleSaveNote} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">No companies followed yet.</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              When FASTIQ finds a company worth watching, you can follow it to get real-time alerts.
            </p>
            <button
              onClick={() => navigate('FastIQ')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: '#0021A5' }}
            >
              <Zap className="w-4 h-4" /> Start a company search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}