import { useState } from 'react';
import EditGoalsModal from '@/components/free-tier/EditGoalsModal';
import { industryLabel } from '@/lib/onboardingGoals';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';

const SEEKING_LABELS = { internship: 'Internships', fulltime: 'Full-time roles', both: 'Internships & full-time' };

const Row = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 6px' }}>{label}</p>
    {children}
  </div>
);

const Tag = ({ text }) => (
  <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: INDIGO, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '4px 10px' }}>{text}</span>
);

const Empty = () => <p style={{ fontFamily: FONT, fontSize: 13, color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>Not set yet</p>;

/**
 * Read-only view of the student's career goals. Editing happens in one place
 * (EditGoalsModal → user.career_goals) so the profile, the search preferences,
 * and CLIFF never disagree.
 */
export default function CareerFocusCard({ user, onUpdated }) {
  const [open, setOpen] = useState(false);
  const goals = user?.career_goals || {};
  const roles = goals.target_roles || [];
  const industries = (goals.target_industries || []).map(industryLabel);
  const location = goals.location_preference || user?.location || '';

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', padding: 24 }}>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', margin: '0 0 4px' }}>Career Focus</p>
      <p style={{ fontFamily: FONT, fontSize: 12.5, color: '#475569', margin: '0 0 18px', lineHeight: 1.55 }}>
        This is exactly what CLIFF uses to find and rank your opportunities.
      </p>

      <Row label="I'm looking for">
        {goals.seeking ? <Tag text={SEEKING_LABELS[goals.seeking] || goals.seeking} /> : <Empty />}
      </Row>

      <Row label="Target roles">
        {roles.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{roles.map(r => <Tag key={r} text={r} />)}</div> : <Empty />}
      </Row>

      <Row label="Industries">
        {industries.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{industries.map(i => <Tag key={i} text={i} />)}</div> : <Empty />}
      </Row>

      <Row label="Preferred location">
        {location ? <Tag text={location} /> : <Empty />}
      </Row>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ width: '100%', marginTop: 4, fontFamily: FONT, fontSize: 13.5, fontWeight: 700, color: INDIGO, background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}
      >
        🎯 Update Career Goals
      </button>

      {open && (
        <EditGoalsModal
          user={user}
          goals={user?.career_goals}
          onClose={() => setOpen(false)}
          onSave={() => { setOpen(false); onUpdated?.(); }}
        />
      )}
    </div>
  );
}