import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function formatWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WeeklyLog() {
  const thisMonday = getMonday(new Date());
  const [currentNote, setCurrentNote] = useState('');
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastNotes, setPastNotes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const notes = await base44.entities.AdminWeeklyNotes.list('-week_starting', 10);
      const current = notes.find(n => n.week_starting === thisMonday);
      if (current) {
        setCurrentNote(current.notes || '');
        setCurrentId(current.id);
      }
      // Past 4 weeks (excluding current)
      const past = notes.filter(n => n.week_starting !== thisMonday).slice(0, 4);
      setPastNotes(past);
    } catch (e) {
      console.error('WeeklyLog load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (currentId) {
        await base44.entities.AdminWeeklyNotes.update(currentId, { notes: currentNote });
      } else {
        const created = await base44.entities.AdminWeeklyNotes.create({
          week_starting: thisMonday,
          notes: currentNote,
        });
        setCurrentId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('WeeklyLog save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Weekly Log</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">Week of {formatWeek(thisMonday)}</p>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        {loading ? (
          <p className="text-slate-600 text-sm">Loading…</p>
        ) : (
          <textarea
            value={currentNote}
            onChange={e => setCurrentNote(e.target.value)}
            onBlur={save}
            placeholder="Write this week's notes here… (markdown supported)"
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-y font-mono"
          />
        )}

        {/* Past weeks */}
        {pastNotes.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Prior Weeks</p>
            {pastNotes.map(note => (
              <div key={note.id} className="border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(note.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <span className="text-slate-400 text-sm">Week of {formatWeek(note.week_starting)}</span>
                  <span className="text-slate-600 text-xs">{expanded[note.id] ? '▲' : '▼'}</span>
                </button>
                {expanded[note.id] && (
                  <div className="px-4 pb-4 text-slate-400 text-sm whitespace-pre-wrap font-mono bg-slate-800/30">
                    {note.notes || <span className="text-slate-600 italic">No notes for this week.</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}