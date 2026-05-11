import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const SEEKING_OPTS = [
  { key: 'internship', label: 'Internships', sub: 'For current students' },
  { key: 'fulltime', label: 'Full-time jobs', sub: 'For graduating seniors / recent grads' },
  { key: 'both', label: 'Both internships and full-time roles', sub: '' },
  { key: 'exploring', label: 'Still exploring options', sub: '' },
];

const INDUSTRIES = [
  'Tech / Software Engineering', 'Finance', 'Marketing', 'Consulting',
  'Healthcare', 'Data Science', 'Product Management', 'Sales',
  'Education', 'Government / Non-profit',
];

const PRIORITIES = [
  'High salary / compensation',
  'Strong company culture / work-life balance',
  'Remote / hybrid flexibility',
  'Fast career growth',
  'Making an impact',
  'Location-specific (e.g., staying in Florida)',
];

const S = {
  shell: { minHeight: '100vh', background: '#f8f8f8', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', fontFamily: dm },
  inner: { maxWidth: 620, width: '100%' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 100, padding: '6px 14px', marginBottom: 20 },
  tagText: { fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' },
  h1: { fontFamily: pf, fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '0 0 10px' },
  sub: { fontSize: 14, color: '#777', margin: '0 0 36px', lineHeight: 1.65 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: '0 0 6px' },
  sectionSub: { fontSize: 13, color: '#999', margin: '0 0 16px' },
  bigCard: (active) => ({
    display: 'block', width: '100%', textAlign: 'left',
    background: active ? '#FFF5F0' : '#fff',
    border: `1.5px solid ${active ? '#E85D20' : '#E5E5E5'}`,
    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
    marginBottom: 10, transition: 'all 0.15s', minHeight: 'auto',
    boxShadow: active ? '0 2px 12px rgba(232,93,32,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
  }),
  chip: (active) => ({
    background: active ? '#E85D20' : '#fff',
    border: `1px solid ${active ? '#E85D20' : '#E0E0E0'}`,
    borderRadius: 20, padding: '8px 16px',
    fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? '#fff' : '#555',
    cursor: 'pointer', fontFamily: dm,
    transition: 'all 0.15s', minHeight: 'auto',
  }),
  input: { fontFamily: dm, fontSize: 14, color: '#1A1A1A', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '12px 16px', width: '100%', outline: 'none', boxSizing: 'border-box', resize: 'vertical' },
  section: { marginBottom: 36 },
  divider: { borderTop: '1px solid #EBEBEB', margin: '4px 0 36px' },
  btnPrimary: { fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px 28px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 6px 20px rgba(232,93,32,0.25)', transition: 'opacity 0.15s' },
  btnSkip: { fontFamily: dm, fontSize: 13, color: '#AAAAAA', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16, display: 'block', width: '100%', textAlign: 'center', minHeight: 'auto' },
};

export default function SetSearchGoals({ onGoalsSaved, onTabChange }) {
  const { user } = useAuth();
  const cg = user?.career_goals || {};

  const [seeking, setSeeking] = useState(cg.seeking || '');
  const [industries, setIndustries] = useState(cg.target_industries || []);
  const [industryOther, setIndustryOther] = useState(cg.industry_other || '');
  const [priorities, setPriorities] = useState(cg.priorities || []);
  const [freeText, setFreeText] = useState(cg.goals_free_text || '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggleIndustry = (v) => setIndustries(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const togglePriority = (v) => setPriorities(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalIndustries = industryOther.trim()
        ? [...industries, industryOther.trim()]
        : industries;
      await base44.auth.updateMe({
        career_goals: {
          ...cg,
          seeking,
          target_industries: finalIndustries,
          industry_other: industryOther,
          priorities,
          goals_free_text: freeText,
          saved_at: new Date().toISOString(),
        },
      });
      onGoalsSaved?.();
      setDone(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleSkip = () => onTabChange ? onTabChange('home') : navigate('FreeTierDashboard');

  // ── DONE STATE ──
  if (done) {
    return (
      <div style={S.shell}>
        <div style={{ ...S.inner, textAlign: 'center', paddingTop: 60 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFF5F0', border: '2px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>🎯</div>
          <h1 style={{ ...S.h1, textAlign: 'center', marginBottom: 10 }}>Goals saved! Your workspace is now personalized.</h1>
          <p style={{ fontSize: 14, color: '#777', maxWidth: 420, margin: '0 auto 12px', lineHeight: 1.7 }}>
            The Agent will now prioritize opportunities, suggestions, and messaging that match what you're looking for.
          </p>
          <p style={{ fontSize: 13, color: '#999', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.6 }}>
            You're one step closer to landing your next opportunity.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onTabChange ? onTabChange('career_path') : navigate('FreeTierDashboard')}
              style={{ ...S.btnPrimary, width: 'auto', padding: '14px 28px' }}
            >
              Open My Application Tracker
            </button>
            <button
              onClick={() => onTabChange ? onTabChange('resume') : navigate('ResumeTailoring')}
              style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#E85D20', background: '#FFF5F0', border: '1.5px solid rgba(232,93,32,0.25)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto' }}
            >
              Let the Agent Review My Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.shell}>
      <div style={S.inner}>
        {/* Header */}
        <div style={S.tag}><span style={S.tagText}>Set Your Search Goals</span></div>
        <h1 style={S.h1}>Set Your Search Goals</h1>
        <p style={S.sub}>This takes 2 minutes and helps the Agent personalize your entire workspace — opportunities, resume suggestions, outreach tone, and more.</p>

        {/* Section 1 */}
        <div style={S.section}>
          <span style={S.sectionLabel}>Section 1</span>
          <p style={S.sectionTitle}>What are you primarily looking for?</p>
          {SEEKING_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setSeeking(opt.key)} style={S.bigCard(seeking === opt.key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${seeking === opt.key ? '#E85D20' : '#CCC'}`, background: seeking === opt.key ? '#E85D20' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700, transition: 'all 0.15s' }}>
                  {seeking === opt.key && '✓'}
                </div>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: seeking === opt.key ? '#E85D20' : '#1A1A1A', margin: 0 }}>{opt.label}</p>
                  {opt.sub && <p style={{ fontFamily: dm, fontSize: 12, color: '#999', margin: '2px 0 0' }}>{opt.sub}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div style={S.divider} />

        {/* Section 2 */}
        <div style={S.section}>
          <span style={S.sectionLabel}>Section 2</span>
          <p style={S.sectionTitle}>What industries / roles are you most interested in?</p>
          <p style={S.sectionSub}>Select all that apply.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => toggleIndustry(ind)} style={S.chip(industries.includes(ind))}>{ind}</button>
            ))}
          </div>
          <input
            style={S.input}
            placeholder="Other (type here)..."
            value={industryOther}
            onChange={e => setIndustryOther(e.target.value)}
          />
        </div>
        <div style={S.divider} />

        {/* Section 3 */}
        <div style={S.section}>
          <span style={S.sectionLabel}>Section 3</span>
          <p style={S.sectionTitle}>What's most important to you right now?</p>
          <p style={S.sectionSub}>Select all that apply.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => togglePriority(p)} style={S.chip(priorities.includes(p))}>{p}</button>
            ))}
          </div>
        </div>
        <div style={S.divider} />

        {/* Section 4 */}
        <div style={S.section}>
          <span style={S.sectionLabel}>Section 4 — Optional</span>
          <p style={S.sectionTitle}>Anything else we should know?</p>
          <p style={S.sectionSub}>e.g. "I'm a junior CS major targeting big tech companies"</p>
          <textarea
            style={{ ...S.input, minHeight: 90 }}
            placeholder="Tell us anything that might help us personalize your experience..."
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
          />
        </div>

        {/* CTA */}
        <button onClick={handleSave} disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Goals & Personalize My Workspace →'}
        </button>
        <button onClick={handleSkip} style={S.btnSkip}>Skip for now (I'll do this later)</button>
      </div>
    </div>
  );
}