import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { recordMemorySignal } from '@/functions/recordMemorySignal';
import MemoryRow from '@/components/memory/MemoryRow';
import { Brain, Loader2 } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const CATEGORY_LABELS = {
  preferred_industries: 'Industries you like',
  disliked_industries: 'Industries to avoid',
  preferred_locations: 'Preferred locations',
  excluded_locations: 'Locations to avoid',
  target_companies: 'Companies you\u2019re targeting',
  avoided_companies: 'Companies to avoid',
  preferred_work_style: 'Work style',
  salary_goals: 'Salary goals',
  internship_vs_fulltime: 'Internship vs full-time',
  remote_preference: 'Remote preference',
  networking_comfort: 'Networking comfort',
  interview_confidence: 'Interview confidence',
  application_habits: 'Application habits',
  resume_preferences: 'Resume preferences',
  career_priorities: 'Career priorities',
};

// "What CLIFF Knows About You" — full transparency into CLIFF's memory.
export default function CliffMemory() {
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = (email) => {
    base44.entities.StudentMemory.filter({ user_email: email }, '-confidence', 200)
      .then(setMemories)
      .catch(() => setMemories([]));
  };

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); load(u.email); })
      .catch(() => base44.auth.redirectToLogin('/#/CliffMemory'));
  }, []);

  const handleChange = async (id, patch) => {
    setMemories(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
    await base44.entities.StudentMemory.update(id, patch).catch(() => {});
  };

  const handleDelete = async (id) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    await base44.entities.StudentMemory.delete(id).catch(() => {});
  };

  const tellCliff = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    await recordMemorySignal({ text: text.trim() }).catch(() => {});
    setText('');
    setSaving(false);
    if (user) load(user.email);
  };

  const grouped = {};
  for (const m of memories || []) {
    (grouped[m.category] = grouped[m.category] || []).push(m);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 80px' }}>
        <button onClick={() => { window.location.hash = '#/FreeTierDashboard'; }}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 12, minHeight: 44 }}>
          ← Back to dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Brain size={22} color="#7c3aed" />
          <h1 style={{ fontFamily: dm, fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>What CLIFF Knows About You</h1>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>
          Everything I've learned from what you've told me and how you use CFF. Edit anything, turn it off, or delete it — you're in control.
        </p>

        {/* Tell CLIFF something */}
        <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 16, padding: '16px 18px', marginBottom: 24 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>Tell me a preference</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && tellCliff()}
              placeholder={'e.g. "I don\u2019t want sales roles" or "I only want Florida"'}
              style={{ flex: 1, fontFamily: dm, fontSize: 13, color: '#111827', background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', outline: 'none', minWidth: 0 }} />
            <button onClick={tellCliff} disabled={saving || !text.trim()}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: text.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e5e7eb', border: 'none', borderRadius: 10, padding: '0 18px', cursor: text.trim() ? 'pointer' : 'default', minHeight: 44, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Remember it'}
            </button>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>

        {memories === null ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : memories.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #e5e7eb', borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>I'm still getting to know you</p>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
              As you save jobs, skip roles, and tell me preferences, I'll remember what matters — and my recommendations will get sharper every week.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                {CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(m => (
                  <MemoryRow key={m.id} memory={m} onChange={handleChange} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}