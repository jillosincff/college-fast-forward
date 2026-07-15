import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { matchTemplate, buildTrajectory } from '@/lib/careerTrajectory/engine';
import PathSteps from '@/components/trajectory/PathSteps';
import { X } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "Your Path Forward" — the student-facing trajectory view. Personalizes an
// approved pathway template; never invents a path when none exists.
export default function YourPathForward({ user, onClose }) {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [record, setRecord] = useState(null);   // StudentCareerTrajectory
  const [template, setTemplate] = useState(null);
  const [view, setView] = useState(null);        // buildTrajectory output
  const [noMatch, setNoMatch] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [showAlt, setShowAlt] = useState(false);
  const altLogged = useRef(false);

  const logOutcome = (event, extra = {}) => {
    base44.entities.CareerTrajectoryOutcome.create({
      user_email: user.email, event,
      template_id: template?.id || extra.template_id || '',
      trajectory_id: record?.id || extra.trajectory_id || '',
      ...extra.fields,
    }).catch(() => {});
  };

  const applyMatch = async (tpl, confidence, existing) => {
    const t = buildTrajectory(user, tpl);
    setTemplate(tpl);
    setView(t);
    setNoMatch(false);
    const payload = {
      user_email: user.email,
      target_role: tpl.target_role,
      target_industry: tpl.target_industry || '',
      template_id: tpl.id,
      selected_pathway_name: tpl.pathway_name,
      current_stage: t.stageKey,
      recommended_next_roles: t.nextRoles,
      recommended_internship_types: tpl.internship_types || [],
      recommended_campus_actions: tpl.campus_experiences || [],
      long_term_path: t.primaryPath,
      alternative_path: t.altPath,
      confidence_level: confidence,
      status: 'active',
      last_recalculated_at: new Date().toISOString(),
    };
    let rec = existing;
    try {
      if (existing) rec = await base44.entities.StudentCareerTrajectory.update(existing.id, payload);
      else rec = await base44.entities.StudentCareerTrajectory.create(payload);
    } catch { /* view still renders without a saved record */ }
    setRecord(rec || null);
    base44.entities.CareerTrajectoryOutcome.create({
      user_email: user.email, event: 'trajectory_shown', template_id: tpl.id, trajectory_id: rec?.id || '',
    }).catch(() => {});
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [tpls, trajRows, plans] = await Promise.all([
        base44.entities.CareerTrajectoryTemplate.filter({ review_status: 'approved' }, undefined, 100).catch(() => []),
        base44.entities.StudentCareerTrajectory.filter({ user_email: user.email }).catch(() => []),
        base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }).catch(() => []),
      ]);
      if (cancelled) return;
      setTemplates(tpls);
      const existing = (trajRows || []).find(r => r.status === 'active') || (trajRows || [])[0] || null;
      const plan = (plans || [])[0];
      const goalText = existing?.target_role
        || plan?.goal_summary || plan?.goal_text
        || user?.career_goals?.target_role || user?.career_goals?.dream_job || '';
      const match = matchTemplate(goalText, tpls);
      if (match) await applyMatch(match.template, match.confidence, existing);
      else { setNoMatch(true); setRecord(existing); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tryGoal = async () => {
    if (!goalInput.trim()) return;
    const match = matchTemplate(goalInput, templates);
    if (match) { setGoalInput(''); await applyMatch(match.template, match.confidence, record); }
    else setNoMatch(true);
  };

  const confirmPath = async () => {
    if (record) {
      const updated = await base44.entities.StudentCareerTrajectory.update(record.id, { student_confirmed: true }).catch(() => null);
      if (updated) setRecord(updated);
    }
    logOutcome('confirmed');
  };

  const notForMe = async () => {
    if (record) await base44.entities.StudentCareerTrajectory.update(record.id, { status: 'dismissed' }).catch(() => {});
    logOutcome('dismissed');
    setTemplate(null); setView(null); setNoMatch(true); setRecord(null);
  };

  const toggleAlt = () => {
    if (!showAlt && !altLogged.current) { altLogged.current = true; logOutcome('alternative_viewed'); }
    setShowAlt(!showAlt);
  };

  const btn = (primary) => ({ fontFamily: dm, fontSize: 13, fontWeight: 800, borderRadius: 999, padding: '10px 18px', cursor: 'pointer', minHeight: 44, border: primary ? 'none' : '1px solid #e5e7eb', color: primary ? '#fff' : '#6b7280', background: primary ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px 24px 28px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 8, minHeight: 'auto', minWidth: 'auto' }}><X size={18} /></button>

        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>📍 Your Path Forward</p>

        {loading && <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '16px 0 0' }}>Mapping your path...</p>}

        {!loading && noMatch && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontFamily: dm, fontSize: 13.5, color: '#374151', margin: 0, lineHeight: 1.6 }}>
              I don't have a reliable path for this goal yet. I can still help you identify the skills and entry-level roles that appear most relevant — or tell me the role you're aiming for long-term and I'll check again.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryGoal()}
                placeholder="e.g. Brand Manager, Software Engineer" style={{ flex: 1, fontFamily: dm, border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px' }} />
              <button onClick={tryGoal} style={btn(true)}>Check</button>
            </div>
          </div>
        )}

        {!loading && view && template && (
          <>
            <h2 style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#111827', margin: '8px 0 2px' }}>Your path to {template.target_role}</h2>
            <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: 0, lineHeight: 1.55 }}>{template.pathway_summary}</p>

            <PathSteps title="One realistic path" steps={view.primaryPath} />

            {view.altPath?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>There's more than one way to get there.</p>
                {!showAlt ? (
                  <button onClick={toggleAlt} style={btn(false)}>Show Another Route</button>
                ) : (
                  <>
                    <PathSteps title={view.altPathName || 'Another possible route'} steps={[...view.altPath, template.target_role].filter((s, i, a) => a.indexOf(s) === i)} />
                    {view.altPathNote && <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '6px 0 0', lineHeight: 1.5 }}>{view.altPathNote}</p>}
                  </>
                )}
              </div>
            )}

            <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '12px 16px', marginTop: 16 }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Your strongest next step</p>
              <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.55 }}>{view.nextStepText}</p>
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#374151', margin: '0 0 4px' }}>Why this fits where you are</p>
              <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{view.whyFits}</p>
            </div>

            {view.campusActions.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#374151', margin: '0 0 4px' }}>Build proof on campus</p>
                {view.campusActions.map((c, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '0 0 3px', lineHeight: 1.5 }}>• {c}</p>
                ))}
              </div>
            )}

            <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#15803d', margin: '14px 0 0', lineHeight: 1.55 }}>
              🎯 {view.reassurance[0]} You're not behind.
            </p>

            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: '10px 0 0', lineHeight: 1.5 }}>{template.disclaimer}</p>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {!record?.student_confirmed
                ? <button onClick={confirmPath} style={btn(true)}>This is my path</button>
                : <span style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#15803d', alignSelf: 'center' }}>✓ Saved as your path</span>}
              <button onClick={notForMe} style={btn(false)}>Not for me — try another role</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}