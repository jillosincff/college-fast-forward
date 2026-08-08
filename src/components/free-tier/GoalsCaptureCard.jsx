import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Target, ArrowRight, X } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Shown in the FirstApplicationPackageCard slot to students who closed
// onboarding early and have no career_goals AND no major — so
// getLiveJobMatchesFn has nothing to search. They self-serve goals here, the
// dashboard user refreshes, and FirstApplicationPackageCard renders next load.
const INDUSTRY_CHIPS = [
  'Tech & Engineering',
  'Business & Finance',
  'Marketing & Media',
  'Healthcare & Bio',
  'Law & Government',
  'Creative & Entertainment',
];
const ROLE_SUGGESTIONS = [
  'Software Engineer Intern',
  'Marketing Intern',
  'Data Analyst',
  'Business Analyst',
  'Product Manager Intern',
  'UX Design Intern',
  'Finance Intern',
  'Consulting Intern',
];

export default function GoalsCaptureCard({ user, onSaved }) {
  const queryClient = useQueryClient();
  const [seeking, setSeeking] = useState('both');
  const [roles, setRoles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [roleInput, setRoleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Release first-session focus mode so the dashboard renders around this card.
  // FirstApplicationPackageCard dispatches this same event when it can't build
  // a package (no job found) — our case is the same: nothing to match on yet.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cff:first-package-done'));
  }, []);

  const addRole = (r) => {
    const v = r.trim();
    if (v && !roles.includes(v)) setRoles([...roles, v]);
    setRoleInput('');
  };
  const toggleIndustry = (label) => {
    setIndustries((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const save = async () => {
    let finalRoles = [...roles];
    if (roleInput.trim() && !finalRoles.includes(roleInput.trim())) {
      finalRoles.push(roleInput.trim());
    }
    if (finalRoles.length === 0 && industries.length === 0) {
      setError('Add at least one role or industry so CLIFF can find you a job.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const career_goals = {
        seeking,
        target_roles: finalRoles,
        target_industries: industries,
        saved_at: new Date().toISOString(),
        source: 'goals_capture_card',
      };
      await base44.auth.updateMe({ career_goals });
      const refreshedUser = await base44.auth.me();
      // Mirror EditGoalsModal's refresh so goal-dependent feeds rebuild.
      base44.functions.invoke('refreshDailyDrop', {}).catch(() => {});
      base44.functions.invoke('generateActionPlan', { force: true }).catch(() => {});
      window.dispatchEvent(new CustomEvent('cff:refresh-daily-drop', { detail: { force_refresh: true } }));
      window.dispatchEvent(new CustomEvent('cff:goals-updated'));
      queryClient.removeQueries({ queryKey: ['dailyDrop', refreshedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onSaved?.(refreshedUser);
    } catch (e) {
      setError('Failed to save. Try again.');
    }
    setSaving(false);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const chipBtn = (active) => ({
    fontFamily: dm, fontSize: 12.5, fontWeight: active ? 700 : 600,
    color: active ? '#fff' : '#5b21b6',
    background: active ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
    border: `1.5px solid ${active ? '#7c3aed' : '#ddd6fe'}`,
    borderRadius: 999, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ede9fe 0%, #fff 55%)',
      border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '20px 22px',
      marginBottom: 16, boxShadow: '0 4px 20px rgba(124,58,237,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Target size={13} color="#7c3aed" />
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          One quick thing before CLIFF builds your package
        </span>
      </div>

      <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px', lineHeight: 1.35 }}>
        {firstName}, what kind of role are you after?
      </p>
      <p style={{ fontFamily: dm, fontSize: 13.5, color: '#374151', margin: '0 0 16px' }}>
        CLIFF uses this to match you a real opening and tailor your resume to it. Takes 30 seconds.
      </p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 12.5, fontFamily: dm }}>
          {error}
        </div>
      )}

      {/* Seeking */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#5b21b6', display: 'block', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          I'm looking for
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'internship', label: '🎓 Internships' },
            { key: 'fulltime', label: '💼 Full-time' },
            { key: 'both', label: '🎯 Both' },
          ].map((opt) => (
            <button key={opt.key} onClick={() => setSeeking(opt.key)} style={chipBtn(seeking === opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target roles */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#5b21b6', display: 'block', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Target roles
        </label>
        {roles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {roles.map((r) => (
              <span key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: '1px solid #c4b5fd', color: '#5b21b6', padding: '5px 10px', borderRadius: 999, fontSize: 12.5, fontFamily: dm }}>
                {r}
                <button onClick={() => setRoles(roles.filter((x) => x !== r))} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#7c3aed', fontSize: 14, padding: 0, display: 'flex' }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(roleInput); } }}
          placeholder="Type a role and press Enter…"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd6fe', borderRadius: 8, fontSize: 14, fontFamily: dm, boxSizing: 'border-box', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ROLE_SUGGESTIONS.filter((r) => !roles.includes(r)).slice(0, 5).map((r) => (
            <button key={r} onClick={() => addRole(r)} style={chipBtn(false)}>+ {r}</button>
          ))}
        </div>
      </div>

      {/* Industries */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#5b21b6', display: 'block', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Industries
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INDUSTRY_CHIPS.map((label) => (
            <button key={label} onClick={() => toggleIndustry(label)} style={chipBtn(industries.includes(label))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none',
          borderRadius: 999, padding: '14px 24px', cursor: saving ? 'default' : 'pointer',
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)', opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : <>Find my first job <ArrowRight size={15} /></>}
      </button>
    </div>
  );
}