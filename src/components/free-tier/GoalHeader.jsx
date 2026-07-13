const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Goal-oriented dashboard header: greeting + the student's employment goal + Edit Goal.
export default function GoalHeader({ user, firstName, onEditGoal }) {
  const goals = user?.career_goals || {};
  const role = goals.target_role || (Array.isArray(goals.target_roles) ? goals.target_roles[0] : goals.target_roles) || '';
  const seeking = goals.seeking;
  const loc = goals.location_preference || user?.location_preference || '';
  const seekLabel = seeking === 'internship' ? 'Internship' : seeking === 'fulltime' ? 'Entry-Level Role' : 'Internship or Entry-Level Role';
  const goalText = role
    ? `${role.replace(/\b\w/g, c => c.toUpperCase())} ${seekLabel}${loc ? ` in ${loc}` : ''}`
    : null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)',
      border: '1px solid rgba(109,40,217,0.18)',
      borderRadius: 20,
      padding: 'clamp(20px, 4vw, 26px)',
      marginBottom: 16,
    }}>
      <h1 style={{ fontFamily: dm, fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        {greeting()}, {firstName}.
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Your goal</p>
          <p style={{ fontFamily: dm, fontSize: 'clamp(14px, 3.8vw, 16px)', fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.4 }}>
            {goalText || 'Set your goal so CLIFF knows what to hunt for'}
          </p>
        </div>
        <button
          onClick={onEditGoal}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', background: '#fff', border: '1px solid rgba(109,40,217,0.3)', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', minHeight: 44, flexShrink: 0, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          {goalText ? 'Edit Goal' : 'Set Goal'} ✏️
        </button>
      </div>
    </div>
  );
}